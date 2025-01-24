import { formatObjects, logger } from "@lib";
import { Middleware } from "../middlewareIntitializer";
import {
  getResHeaders,
  getCtypeAndStream,
  handleResPipingError,
  serveRexPage,
} from "@utils";

/**
 * Middleware to handle static file requests in the Rex Server.
 * 
 * This middleware serves static files from the configured `public` directory of the server instance.
 * If the requested file is not found in the `public` directory, it invokes the `next` middleware with a 404 error code.
 * If an error occurs while handling the request, it serves a 503 error page.
 * 
 * @type {Middleware}
 * 
 * @param {Object} params - Middleware parameters.
 * @param {ServerResponse} params.res - The server response to be sent back to the client.
 * @param {ProxyURL} params.proxyURL - The parsed proxy URL for the incoming request.
 * @param {ServerInstance} params.serverInstance - The server instance configuration for handling the request.
 * @param {Function} params.next - The next middleware function in the chain.
 * 
 * @returns {Promise<void>} Resolves once the request is fully processed or the next middleware is invoked.
 * 
 * @example
 * // Example usage in MiddlewareInitializer:
 * staticReqMiddleware({ res, proxyURL, serverInstance, next });
 */
const staticReqMiddleware: Middleware = async ({
  res,
  proxyURL,
  serverInstance: server,
  next,
}) => {
  try {
    // If no public directory is configured, proceed to the next middleware
    if (!server.public) {
      return next();
    }

    // Determine the pathname to look for in the public directory
    const pathname = proxyURL.pathname === "/" ? "index.html" : proxyURL.pathname;

    // Attempt to retrieve the file's content type and read stream
    const ctypeAndStream = await getCtypeAndStream(pathname, server.public);
    if (!ctypeAndStream) {
      return next({ code: "404" }); // File not found, pass 404 error to the next middleware
    }

    const { stream, cType } = ctypeAndStream;

    // Serve the static file with appropriate headers
    res.writeHead(200, "success", getResHeaders(cType));
    stream.pipe(res);

    // Handle any errors during the response piping
    handleResPipingError(res, stream, server.public);
  } catch (error: any) {
    // Log unexpected errors and serve a 503 error page if possible
    logger.error(
      `UNEXPECTED_ERROR_OCCURED_IN_STATIC_REQ_HANDLER ${formatObjects(error)}`
    );
    if (res.headersSent) {
      return res.end("Proxy server error");
    }
    serveRexPage(res, 503);
  }
};

export default staticReqMiddleware;
