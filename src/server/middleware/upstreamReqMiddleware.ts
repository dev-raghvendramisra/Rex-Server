import proxyReq from "../proxyReq";
import { logger } from "@lib";
import { createReqOptions } from "utils/reqUtils";
import { Middleware } from "../middlewareIntitializer";
import { serveRexPage } from "@utils";
import { IncomingMessage, ServerResponse } from "http";
import { ProxyURL } from "@types";

/**
 * Middleware to handle upstream requests in the Rex Server.
 * 
 * This middleware forwards incoming requests to upstream servers defined in the server configuration.
 * It retries with the next available upstream if a failure occurs (e.g., connection refused, timeout, or not found).
 * If all upstream servers fail, it responds with a 502 or 503 error page.
 * 
 * @type {Middleware}
 * 
 * @param {Object} params - Middleware parameters.
 * @param {IncomingMessage} params.req - The incoming HTTP request.
 * @param {ServerResponse} params.res - The server response to be sent back to the client.
 * @param {ProxyURL} params.proxyURL - The proxy URL for the request.
 * @param {REX_CONFIG} params.config - The server configuration containing upstream details.
 * @param {Function} params.next - The next middleware function in the chain.
 * @param {NodeJsErr} [params.err] - Optional error object passed from previous middleware.
 * 
 * @returns {Promise<void>} Resolves once the upstream request has been handled or an error page is served.
 * 
 * @example
 * // Example usage in MiddlewareInitializer:
 * upstreamReqMiddleware({ req, res, proxyURL, config, next, err });
 */
const upstreamReqMiddleware: Middleware = async ({
  req,
  res,
  proxyURL,
  serverInstance,
  config,
  next,
  err,
}) => {
  try {
    if (!config.upstream) {
      return next(err);
    }

    const upstream = [...config.upstream];
    let triedUpstream = 0;

    /**
     * Error handler for upstream request failures.
     * 
     * @param {any} err - The error object.
     * @param {IncomingMessage} req - The original client request.
     * @param {ServerResponse} res - The response object to send back to the client.
     * @param {ProxyURL} proxyURL - The proxy URL being requested.
     */
    const onError = (
      err: any,
      req: IncomingMessage,
      res: ServerResponse,
      proxyURL: ProxyURL
    ) => {
      if (res.headersSent) {
        res.end("Proxy server error");
      } else if (
        err.code === "ECONNREFUSED" ||
        err.code === "ETIMEDOUT" ||
        err.code === "ENOTFOUND"
      ) {
        triedUpstream++;
        if (triedUpstream === upstream.length) {
          serveRexPage(res, 502); // Serve 502 Bad Gateway page after all upstreams fail.
        } else if (triedUpstream < upstream.length) {
          const options = createReqOptions(
            req,
            proxyURL,
            upstream[triedUpstream]
          );
          proxyReq(req, res, options, proxyURL, serverInstance ,0, onError);
        }
      } else {
        serveRexPage(res, 503); // Serve 503 Service Unavailable for other errors.
      }
    };

    // Select the next upstream server
    const nextUpstream = getNextUpstream(
      upstream,
      config.initUpstream as number
    );
    const options = createReqOptions(req, proxyURL, nextUpstream.server);

    // Forward the request to the selected upstream server
    proxyReq(req, res, options, proxyURL, serverInstance ,0, onError);
    return nextUpstream;
  } catch (error) {
    logger.error(`UNEXPECTED_ERROR_OCCURED_IN_UPSTREAM_REQ_HANDLER ${error}`);
    if (res.headersSent) {
      return res.end("Proxy Server error");
    }
    return serveRexPage(res, 503);
  }
};

/**
 * Retrieves the next upstream server to forward the request to.
 * 
 * This function implements round-robin selection of upstream servers.
 * It returns the current upstream server and calculates the index of the next server to use.
 * 
 * @param {string[]} upstreams - An array of upstream server URLs.
 * @param {number} crrIndex - The current index of the upstream server being used.
 * 
 * @returns {Object} An object containing:
 * - `server` (string): The URL of the current upstream server.
 * - `newIndex` (number): The index of the next upstream server to use.
 * 
 * @example
 * const upstreams = ["http://upstream1.com", "http://upstream2.com"];
 * const { server, newIndex } = getNextUpstream(upstreams, 0);
 * console.log(server); // "http://upstream1.com"
 * console.log(newIndex); // 1
 */
export function getNextUpstream(upstreams: string[], crrIndex: number) {
  const server = upstreams[crrIndex];
  const newIndex = (crrIndex + 1) % upstreams.length;
  return {
    server,
    newIndex,
  };
}

export default upstreamReqMiddleware;
