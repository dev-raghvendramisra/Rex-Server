import proxyReq  from "../proxyReq";
import { logger } from "@lib";
import { createReqOptions } from "utils/reqUtils";
import { Middleware } from "../middlewareIntitializer";
import { staticResponse } from "@utils";

const upstreamReqMiddleware : Middleware = async({req,res,proxyURL,config,next,err})=>{
  try {
      if(!config.upstream){
        return next(err)
      }
      const upstream = config.upstream
      const nextUpstream = getNextUpstream(upstream,config.initUpstream as number)
      const options = createReqOptions(req,proxyURL,nextUpstream.server)
      proxyReq(req,res,options,proxyURL,0)
      return nextUpstream
  } catch (error) {
    logger.error(`UNEXPECTED_ERROR_OCCURED_IN_UPSTREAM_REQ_HANDLER ${error}`)
    if(res.headersSent){
       return res.end("Proxy Server error")
    }
    return staticResponse(res,503)
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

export default upstreamReqMiddleware