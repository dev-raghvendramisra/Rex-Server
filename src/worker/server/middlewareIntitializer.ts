import { NodeJsErr, REX_CONFIG, ServerInstance } from "@types";
import { IncomingMessage, ServerResponse } from "http";
import { ProxyURL } from "@types";
import { getURL } from "@utils";

type MiddlewareProps = {
  req: IncomingMessage;
  res: ServerResponse;
  config: REX_CONFIG;
  proxyURL: ProxyURL;
  serverInstance: ServerInstance;
  next: (err?: NodeJsErr) => void;
  err?: NodeJsErr;
};

export type Middleware = (props: MiddlewareProps) => void;

/**
 * Initializes a middleware chain for handling incoming HTTP requests.
 * 
 * This function creates a middleware pipeline where each handler is executed sequentially.
 * The `next` function is used to proceed to the next handler in the chain. If the `req` socket
 * is connected to port 80 and the server configuration includes an instance running on port 443,
 * the client is redirected to the HTTPS version of the request.
 * 
 * @param {REX_CONFIG} config - The server configuration object, containing details like server instances and settings.
 * @param {ServerInstance} serverInstance - The specific server instance configuration for handling the current request.
 * @param {...Middleware[]} handlers - An array of middleware functions to process the request sequentially.
 * 
 * @returns {(req: IncomingMessage, res: ServerResponse) => void} - A function that processes the incoming request and response.
 * 
 * @example
 * const middleware = MiddlewareInitializer(config, serverInstance, handler1, handler2);
 * http.createServer(middleware).listen(80);
 */
export default function MiddlewareInitializer(
  config: REX_CONFIG,
  serverInstance: ServerInstance,
  ...handlers: Array<Middleware>
) {
  return (req: IncomingMessage, res: ServerResponse) => {
    // Redirect HTTP (port 80) to HTTPS (port 443) if configured
    if (
      req.socket.localPort == 80 &&
      config.server.instances.find((instance) => instance.port == 443)
    ) {
      res.writeHead(301, { location: `https://${req.headers.host}${req.url}` });
      res.end("Go secure!");
      return;
    }

    // Generate the proxy URL from the request
    const proxyURL = getURL(req, req.url);
    let currentHandler = 0;

    /**
     * Calls the next middleware handler in the chain, passing any errors if they exist.
     * 
     * @param {NodeJsErr} [err] - Optional error object to be passed to the next middleware.
     */
    const next = (err?: NodeJsErr) => {
      currentHandler++;
      if (currentHandler < handlers.length) {
        handlers[currentHandler]({
          req,
          res,
          config,
          proxyURL,
          serverInstance,
          next,
          err,
        });
      }
    };

    // Start the middleware chain if handlers are provided
    if (handlers.length > 0) {
      handlers[0]({
        req,
        res,
        config,
        proxyURL,
        serverInstance,
        next,
      });
    }
  };
}
