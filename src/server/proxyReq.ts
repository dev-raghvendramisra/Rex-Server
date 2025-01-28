import { IncomingMessage, RequestOptions, ServerResponse, ClientRequest } from "http";
import { logger } from "@lib";
import { createHttpReq, createHttpsReq, createReqOptions, handleRedirects, performCaching } from "utils/reqUtils";
import { ProxyURL, ServerInstance } from "@types";
import { getResHeaders, handleResPipingError, serveRexPage } from "@utils";

let maxRedirect = 5;

/**
 * Handles proxying a request to a target server, supports both HTTP and HTTPS protocols.
 * 
 * This function creates an HTTP/HTTPS request to the destination specified in the options,
 * pipes the incoming request to the proxy request, and handles the response by forwarding it
 * back to the client. It also supports handling redirects, forwarding requests to new locations
 * if specified in the response headers.
 * 
 * The function also handles errors such as connection refusal, timeouts, and unknown host errors,
 * and will attempt to provide a fallback response (e.g., a 502 or 503 error page) if a failure occurs.
 * 
 * @param {IncomingMessage} req - The incoming HTTP request from the client.
 * @param {ServerResponse} res - The server response that will be sent back to the client.
 * @param {RequestOptions} options - The options for the proxy request, including the target URL and other settings.
 * @param {ProxyURL} proxyURL - The URL that the incoming request is being proxied to.
 * @param {number} [crrRedirects=0] - The current number of redirects followed so far. Defaults to 0.
 * @param {(err: any, req: IncomingMessage, res: ServerResponse, proxyURL: ProxyURL) => void} [onError] - An optional callback function that is triggered when an error occurs during the proxy request.if not passed default error handling steps will be taken!
 * 
 * @returns {ClientRequest} - The proxy request object.
 * 
 * @throws {Error} If there are any issues with the proxy request or response handling.
 * 
 * @example
 * // Example usage:
 * proxyRequest(req, res, options, proxyURL, 0, (err, req, res, proxyURL) => {
 *   console.error("Proxy request failed:", err);
 *   res.end("An error occurred while processing the request.");
 * });
 */
export default async function proxyRequest(
  req: IncomingMessage,
  res: ServerResponse,
  options: RequestOptions,
  proxyURL: ProxyURL,
  serverInstance:ServerInstance,
  crrRedirects = 0,
  onError?: (err: any, req: IncomingMessage, res: ServerResponse, proxyURL: ProxyURL) => void
) {
  handleRedirects(maxRedirect, res, crrRedirects);
  let proxyReq: ClientRequest;

  // Function to handle proxy response
  const proxyReqHandler = (proxyRes: IncomingMessage) => {
    // Handle redirects
    if (proxyRes.headers.location && proxyRes.headers.location.includes("https")) {
      const newOptions = createReqOptions(req, proxyURL, proxyRes.headers.location);
      return proxyRequest(req, res, newOptions, proxyURL, serverInstance,crrRedirects, onError);
    }

    // Forward proxy response to the client
    const headers = getResHeaders(undefined, proxyRes.headers,serverInstance)
    res.writeHead(proxyRes.statusCode as number, proxyRes.statusMessage, headers);
    proxyRes.pipe(res);
    handleResPipingError(res, proxyRes);
    return performCaching(serverInstance,proxyRes,headers,proxyURL)
  };

  // Choose the protocol and create the proxy request
  if (options.protocol === "https:") {
    proxyReq = createHttpsReq(options, proxyReqHandler);
  } else {
    proxyReq = createHttpReq(options, proxyReqHandler);
  }

  // Pipe the incoming request to the proxy request
  req.pipe(proxyReq);

  // Handle proxy request errors
  proxyReq.on("error", (err: any) => {
    logger.error(`ERROR_SENDING_PROXYREQ_FOR_${options.host} : ${err}`);
    if (onError) {
      return onError(err, req, res, proxyURL);
    }
    if (res.headersSent) {
      res.end("Proxy server error");
    } else if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT" || err.code === "ENOTFOUND") {
      serveRexPage(res, 502);
    } else {
      serveRexPage(res, 503);
    }
  });

  return proxyReq;
}
