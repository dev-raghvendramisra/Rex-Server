import { ClientRequest, IncomingMessage, ServerResponse } from "http";
import { request as httpsRequest, RequestOptions } from "https";
import { request as httpRequest } from "http";
import { URL } from "url";
import { formatObjects, logger } from "@lib";
import { ProxyURL } from "@types";
import path from "path";
import { constants, createReadStream } from "fs";
import { contentType } from "mime-types";
import { TLSSocket } from "tls";
import { access } from "fs/promises";

/**
 * Creates a request options object for an HTTP or HTTPS request.
 * 
 * This function constructs a `RequestOptions` object using the provided request (`req`), proxy URL (`proxyURL`), and destination URL (`destination`).
 * The options include the method, headers, host, protocol, and path to be used for the proxy request.
 * 
 * @param {IncomingMessage} req - The incoming HTTP request.
 * @param {ProxyURL} proxyURL - The URL object representing the proxy request.
 * @param {string} destination - The destination URL to forward the request to.
 * 
 * @returns {RequestOptions} - The constructed request options for the proxy request.
 * 
 * @example
 * const options = createReqOptions(req, proxyURL, "http://example.com");
 * console.log(options); // Logs the generated request options.
 */
export function createReqOptions(req: IncomingMessage, proxyURL: URL, destination: string): RequestOptions {
  let destURL = getURL(destination);
  const options: RequestOptions = {
    headers: { ...getReqHeaders(req), host: destURL.host },
    method: req.method,
    port: destURL.protocol == "https:" ? 443 : destURL.port || 80,
    host: destURL.host,
    protocol: destURL.protocol,
    hostname: destURL.hostname,
    path: proxyURL.pathname || '' + proxyURL.search || '',
  };
  return options;
}

/**
 * Creates an HTTPS request to the destination specified in the options.
 * 
 * This function creates an HTTPS request using the provided options and attaches a response handler.
 * 
 * @param {RequestOptions} options - The options for the HTTPS request.
 * @param {(res: IncomingMessage) => void} reqHandler - The function to handle the response.
 * 
 * @returns {ClientRequest} - The created HTTPS client request.
 * 
 * @example
 * const proxyReq = createHttpsReq(options, (res) => { console.log(res.statusCode); });
 * proxyReq.end();
 */
export function createHttpsReq(options: RequestOptions, reqHandler: (res: IncomingMessage) => void): ClientRequest {
  const proxyReq = httpsRequest(options);
  proxyReq.on("response", reqHandler);
  return proxyReq;
}

/**
 * Creates an HTTP request to the destination specified in the options.
 * 
 * This function creates an HTTP request using the provided options and attaches a response handler.
 * 
 * @param {RequestOptions} options - The options for the HTTP request.
 * @param {(res: IncomingMessage) => void} reqHandler - The function to handle the response.
 * 
 * @returns {ClientRequest} - The created HTTP client request.
 * 
 * @example
 * const proxyReq = createHttpReq(options, (res) => { console.log(res.statusCode); });
 * proxyReq.end();
 */
export function createHttpReq(options: RequestOptions, reqHandler: (res: IncomingMessage) => void): ClientRequest {
  const proxyReq = httpRequest(options);
  proxyReq.on("response", reqHandler);
  return proxyReq;
}

/**
 * Handles redirects in proxy requests by checking the maximum number of redirects allowed.
 * 
 * This function checks if the number of redirects exceeds the maximum allowed (`maxRedirect`). If it does,
 * it responds with a "Too many redirects" message. Otherwise, it continues with the redirect handling.
 * 
 * @param {number} maxRedirect - The maximum number of allowed redirects.
 * @param {ServerResponse} res - The server response object.
 * @param {number} crrRedirect - The current number of redirects.
 * 
 * @returns {void} - Returns once the redirect is either handled or the maximum redirects are exceeded.
 * 
 * @example
 * handleRedirects(5, res, 3); // Checks if further redirects are allowed.
 */
export function handleRedirects(maxRedirect: number, res: ServerResponse, crrRedirect: number) {
  crrRedirect++;
  if (crrRedirect > maxRedirect) {
    res.writeHead(303, { "content-type": "text/html" });
    return res.end("Too many redirects");
  }
}

/**
 * Generates a URL from either an incoming request or a string.
 * 
 * This function either generates a URL from the incoming request (`req`) or from a provided string. If the URL is a valid localhost, 
 * it defaults to `http://` as the protocol.
 * 
 * @param {IncomingMessage | string} req - The incoming HTTP request or a string representing a URL.
 * @param {string} [path] - An optional path to append to the generated URL.
 * 
 * @returns {ProxyURL} - The generated `ProxyURL` object representing the URL.
 * 
 * @example
 * const url = getURL(req);
 * console.log(url); // Logs the generated URL based on the request.
 */
export function getURL(req: IncomingMessage | string, path?: string) {
  let url: string;
  if (typeof req == "string") {
    if (req.startsWith("localhost")) {
      url = `http://${req}`;
    } else url = req;
  } else {
    url = req.socket instanceof TLSSocket ? `https://${req.headers.host}` : `http://${req.headers.host}`;
  }
  return new ProxyURL(url, path);
}

/**
 * Retrieves the content type and stream of a static file for the specified pathname.
 * 
 * This function checks if the static file exists in the given directory and retrieves its content type 
 * and read stream if the file is accessible. If the file does not exist or cannot be read, it returns null.
 * 
 * @param {string} pathname - The path to the static file.
 * @param {string} staticDir - The directory where static files are stored.
 * 
 * @returns {Promise<{ cType: string, stream: ReadStream } | null>} - The content type and stream of the file, or null if not found.
 * 
 * @example
 * const { cType, stream } = await getCtypeAndStream("index.html", "/path/to/static");
 * console.log(cType); // Logs the content type of the file.
 */
export async function getCtypeAndStream(pathname: string, staticDir: string) {
  const filePath = path.join(staticDir, pathname);
  const cType = contentType(path.extname(filePath));
  if (!cType) {
    return null;
  }
  try {
    await access(filePath, constants.R_OK);
  } catch (error) {
    return null;
  }
  const stream = createReadStream(filePath, cType.includes("text") ? { encoding: "utf-8" } : undefined);
  return {
    cType,
    stream,
  };
}

/**
 * Retrieves the request headers, excluding hop-by-hop headers.
 * 
 * This function processes the incoming request headers and removes certain hop-by-hop headers (such as "connection", "keep-alive", etc.),
 * and adds additional headers such as "X-Forwarded-For", "X-Forwarded-Proto", and others.
 * 
 * @param {IncomingMessage} req - The incoming HTTP request from the client.
 * 
 * @returns {Object} - The cleaned request headers, including new headers for proxying.
 * 
 * @example
 * const headers = getReqHeaders(req);
 * console.log(headers); // Logs the modified headers with proxy-specific headers.
 */
export function getReqHeaders(req: IncomingMessage) {
  const hopHeaders = [
    "connection",
    "upgrade",
    "keep-alive",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
  ];
  const headers = Object.fromEntries(
    Object.entries(req.headers).filter(([key]) => !hopHeaders.includes(key.toLowerCase()))
  );
  return {
    ...headers,
    "Via": `1.1 ${req.headers.host}`,
    "X-Forwarded-For": req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    "X-Forwarded-Host": req.headers.host,
    "X-Forwarded-Proto": req.socket instanceof TLSSocket ? "https" : "http",
    "X-Forwarded-Port": req.socket.localPort,
  };
}
