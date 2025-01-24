import { serveRexPage } from "@utils";
import { Middleware } from "../middlewareIntitializer";

/**
 * Fallback controller middleware for handling unprocessed requests or errors.
 * 
 * This middleware serves an error page based on the error code provided. If no error code
 * is specified, it defaults to a standard welcome response. It acts as the last resort in
 * the middleware chain, ensuring that all unhandled errors or requests are properly addressed.
 * 
 * @type {Middleware}
 * 
 * @param {Object} params - Middleware parameters.
 * @param {ServerResponse} params.res - The server response object used to send the error page.
 * @param {NodeJsErr} [params.err] - Optional error object containing details about the failure.
 * 
 * @returns {void} Serves an error page based on the provided error code or a default response.
 * 
 * @example
 * // Example usage in MiddlewareInitializer:
 * fallbackController({ res, err });
 */
const fallbackController: Middleware = ({ res, err }) => {
  return serveRexPage(res, err?.code ? Number(err.code) : undefined);
};

export default fallbackController;
