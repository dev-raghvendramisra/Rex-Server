import { NodeJsErr, REX_CONFIG, ServerInstance } from "@types";
import { IncomingMessage, ServerResponse } from "http";
import { ProxyURL } from "@types";
import { getURL } from "@utils";

type MiddlewareProps = {
    req: IncomingMessage,
  res: ServerResponse,
  config: REX_CONFIG,
  proxyURL: ProxyURL,
  serverInstance:ServerInstance,
  next: (err?:NodeJsErr) => void,
  err ?: NodeJsErr
}
export type Middleware = (props : MiddlewareProps) => void;


export default function MiddlewareIntitializer(config:REX_CONFIG,serverInstance:ServerInstance,...handlers: Array<Middleware>) {
  return (req: IncomingMessage, res: ServerResponse) => {
    const proxyURL = getURL(req.headers.host as string,req.url);

    let currentHandler = 0;

    const next = (err ?: NodeJsErr) => {
      currentHandler++;
      if (currentHandler < handlers.length) {
        handlers[currentHandler]({req, res,config, proxyURL,serverInstance, next, err});
      }
    };

    if (handlers.length > 0) {
      handlers[0]({req, res, config,proxyURL,serverInstance, next});
    }
  };
}
