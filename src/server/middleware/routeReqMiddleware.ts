import { logger } from "@lib";
import proxyReq from "../proxyReq";
import { createReqOptions } from "utils/reqUtils";
import { Middleware } from "../middlewareIntitializer";
import { serveRexPage } from "@utils";
import { ProxyURL } from "@types";

/**
 * Middleware to handle route-based proxy requests in Rex Server.
 * 
 * This middleware checks the configured routes for a matching path. If a match is found, 
 * the request is proxied to the specified destination. If no route matches, it invokes 
 * the `next` middleware with a 404 error code.
 * 
 * If an error occurs during request handling, a 503 error page is served.
 * 
 * @type {Middleware}
 * 
 * @param {Object} params - Middleware parameters.
 * @param {IncomingMessage} params.req - The incoming HTTP request.
 * @param {ServerResponse} params.res - The server response to be sent back to the client.
 * @param {ProxyURL} params.proxyURL - The parsed proxy URL for the incoming request.
 * @param {ServerInstance} params.serverInstance - The server instance configuration containing routes.
 * @param {Function} params.next - The next middleware function in the chain.
 * @param {NodeJsErr} [params.err] - Optional error object passed from previous middleware.
 * 
 * @returns {void} Proxies the request to the route destination or invokes the next middleware.
 * 
 * @example
 * // Example usage in MiddlewareInitializer:
 * routeReqMiddleware({ req, res, proxyURL, serverInstance, next });
 */
const routeReqMiddleware: Middleware = ({
  req,
  res,
  serverInstance,
  proxyURL,
  next,
  err,
}) => {
  const routes = serverInstance.routes;

  // If no routes are configured, proceed to the next middleware
  if (!routes?.length) {
    return next(err);
  }

  try {
    const routeReq = proxyURL.pathname;

    // Find a matching route for the request
    let route = routes?.find((r) => r.path === routeReq);
    let pathname = "";
    // Handle wildcard routes (e.g., "/*")
    if (!route) {
      const fallBackRoute = routes.find((r) => r.path === "/*")
      if (fallBackRoute) {
        pathname = proxyURL.pathname
        route = fallBackRoute
      } else {
        return next({ code: "404" }); // No matching route, invoke next middleware with 404
      }
    }

    // Create proxy request options and forward the request
    const options = createReqOptions(req, {...proxyURL,pathname} as ProxyURL, route.destination);
    proxyReq(req, res, options, proxyURL, 0);
  } catch (error) {
    // Log the error and serve a 503 error page if possible
    logger.error("ERROR_OCCURRED_IN_ROUTE_REQ_HANDLER", error);
    if (res.headersSent) {
      return res.end("Proxy Server error");
    }
    return serveRexPage(res, 503);
  }
};

export default routeReqMiddleware;
