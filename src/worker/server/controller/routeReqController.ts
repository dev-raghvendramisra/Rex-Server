import { logger } from "@lib";
import proxyReq from "../proxyReq";
import { createReqOptions } from "utils/reqUtils";
import { Middleware } from "../middlewareIntitializer";

const routeReqHandler : Middleware = ({req,res,serverInstance,proxyURL,next})=>{
  const routes = serverInstance.routes
  try {
   const routeReq = proxyURL.pathname
   const route = routes?.find((r)=>r.path == routeReq)
   if(!route){
    return next();
   }
   const options = createReqOptions(req,proxyURL,route.destination)
   proxyReq(req,res,options,proxyURL,0)
  } catch (error) {
    logger.error("Error occured in routeReqHandler",error)
    res.writeHead(500,"Internal server error",{"content-type":"text/html"})
    res.end("Internal server error")
  }
}

export default routeReqHandler