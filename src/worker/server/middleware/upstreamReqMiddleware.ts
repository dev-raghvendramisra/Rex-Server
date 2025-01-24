import proxyReq from "../proxyReq";
import { logger } from "@lib";
import { createReqOptions } from "utils/reqUtils";
import { Middleware } from "../middlewareIntitializer";
import { staticResponse } from "@utils";
import { IncomingMessage, ServerResponse } from "http";
import { ProxyURL } from "@types";

const upstreamReqMiddleware: Middleware = async ({
  req,
  res,
  proxyURL,
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
    const onError = (
      err: any,
      req: IncomingMessage,
      res: ServerResponse,
      proxyURL: ProxyURL
    ) => {
      if (res.headersSent) {
        res.end("Proxy server error");
      } else if (
        err.code == "ECONNREFUSED" ||
        err.code === "ETIMEDOUT" ||
        err.code == "ENOTFOUND"
      ) {
        triedUpstream++;
        if (triedUpstream == upstream.length) {
          staticResponse(res, 502);
        } else if (triedUpstream < upstream.length) {
          const options = createReqOptions(
            req,
            proxyURL,
            upstream[triedUpstream]
          );
          proxyReq(req, res, options, proxyURL, 0, onError);
        }
      } else {
        staticResponse(res, 503);
      }
    };

    const nextUpstream = getNextUpstream(
      upstream,
      config.initUpstream as number
    );
    const options = createReqOptions(req, proxyURL, nextUpstream.server);
    proxyReq(req, res, options, proxyURL, 0, onError);
    return nextUpstream;
  } catch (error) {
    logger.error(`UNEXPECTED_ERROR_OCCURED_IN_UPSTREAM_REQ_HANDLER ${error}`);
    if (res.headersSent) {
      return res.end("Proxy Server error");
    }
    return staticResponse(res, 503);
  }
};

export function getNextUpstream(upstreams: string[], crrIndex: number) {
  const server = upstreams[crrIndex];
  const newIndex = (crrIndex + 1) % upstreams.length;
  return {
    server,
    newIndex,
  };
}

export default upstreamReqMiddleware;
