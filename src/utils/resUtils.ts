import conf from "conf/conf";
import { getCtypeAndStream } from "./reqUtils";
import { handleResPipingError } from "./errUtils";
import { IncomingMessage, ServerResponse } from "http";
import { formatObjects, logger } from "@lib";

/**
 * Generates response headers by removing hop-by-hop headers and adding Rex-specific headers.
 * 
 * This function customizes the response headers by removing headers that are generally
 * not forwarded between proxies (such as "X-Powered-By" and "Server") and adding specific
 * Rex headers like "X-Powered-By" and "Server". If a `contentType` is provided, it will
 * be included in the response headers as well.
 * 
 * @param {string} [contentType] - Optional content type to be added to the response headers.
 * @param {IncomingMessage} [res] - The incoming HTTP request, which provides access to existing headers.
 * 
 * @returns {Object} The modified headers object, including Rex-specific headers and any additional content type.
 * 
 * @example
 * const headers = getResHeaders('text/html', res);
 * console.log(headers); // Logs the response headers with content-type set to 'text/html'.
 */
export function getResHeaders(contentType?: string, res?: IncomingMessage) {
  const hopHeaders = ["X-Powered-By", "Server","x-powered-by", "server"];
  if (res?.headers) {
    hopHeaders.forEach((header) => {
      delete res.headers[header]; // Remove hop-by-hop headers
    });
  }
  const headers = {
    ...res?.headers,
    "X-Powered-By": "Rex-Server",
    "Server": "Rex-Server",
  };
  if (contentType) headers["content-type"] = contentType; // Add content-type if provided
  return headers;
}

/**
 * Serves a Rex error page or success page based on the provided status code.
 * 
 * This function serves predefined static HTML pages based on the status code:
 * - 200: "welcome.html"
 * - 404: "404.html"
 * - 502: "502.html"
 * - Other codes: "503.html"
 * 
 * If the file for the specified code cannot be found, a 503 error page is served.
 * It also handles the piping of the response stream and logs any errors encountered.
 * 
 * @param {ServerResponse} res - The HTTP response object to send the page.
 * @param {number} [code=200] - The HTTP status code for the page to serve (200, 404, 502, 503).
 * 
 * @returns {Promise<void>} Resolves when the page is served or rejects if an error occurs.
 * 
 * @example
 * serveRexPage(res, 404); // Serves the "404.html" page for a 404 Not Found error.
 */
export const serveRexPage = async (res: ServerResponse, code = 200) => {
  try {
    let fileName: string;
    let statusMessage: string;

    // Determine the appropriate file and message based on the status code
    switch (code) {
      case 200:
        fileName = "welcome.html";
        statusMessage = "Success";
        break;

      case 404:
        fileName = "404.html";
        statusMessage = "Resource not found";
        break;

      case 502:
        fileName = "502.html";
        statusMessage = "Bad gateway";
        break;

      default:
        fileName = "503.html";
        statusMessage = "Service unavailable";
    }

    // Retrieve content type and stream for the selected file
    const ctypeAndStream = await getCtypeAndStream(fileName, conf.STATIC_DIR_PATH);
    if (!ctypeAndStream) {
      throw new Error("File not found");
    }

    const { stream, cType } = ctypeAndStream;

    // Write headers if not already sent
    if (!res.headersSent) {
      res.writeHead(code, statusMessage, getResHeaders(cType));
    }

    // Pipe the stream to the response and handle errors during piping
    stream.pipe(res);
    handleResPipingError(res, stream, conf.STATIC_DIR_PATH);
  } catch (err) {
    // Log the error and serve a generic 503 error page
    logger.error(`ERROR_IN_SERVING: ${formatObjects(err as Object)}`);
    res.writeHead(503, "Service unavailable", { "content-type": "text/html" });
    res.end("<h1>Rex Proxy server error</h1>");
  }
};
