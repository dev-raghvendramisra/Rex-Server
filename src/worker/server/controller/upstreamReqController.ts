import proxyReq  from "../proxyReq";
import { logger } from "@lib";
import { createReqOptions } from "utils/reqUtils";
import { Middleware } from "./../middlewareIntitializer";

const upstreamReqHandler : Middleware = async({req,res,proxyURL,config,next})=>{
  try {
      if(!config.upstream){
        return next()
      }
      const upstream = config.upstream
      const nextUpstream = getNextUpstream(upstream,config.initUpstream as number)
      const options = createReqOptions(req,proxyURL,nextUpstream.server)
      proxyReq(req,res,options,proxyURL,0)
      return nextUpstream
  } catch (error) {
    logger.error(`Unexpected error occured in staticReqHandler ${error}`)
    res.writeHead(500,"internal server error",{"content-type":"text/html"})
    res.end("Internal server error")
  }
}


export function getNextUpstream(upstreams:string[],crrIndex:number){
  const server = upstreams[crrIndex];
  const newIndex = (crrIndex + 1)%upstreams.length
  return {
    server,
    newIndex
  }
}

export default upstreamReqHandler