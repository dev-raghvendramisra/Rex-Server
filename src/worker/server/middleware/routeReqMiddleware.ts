import { logger } from "@lib";
import proxyReq from "../proxyReq";
import { createReqOptions } from "utils/reqUtils";
import { Middleware } from "../middlewareIntitializer";
import { staticResponse } from "@utils";

const routeReqMiddleware : Middleware = ({req,res,serverInstance,proxyURL,next,err})=>{
  const routes = serverInstance.routes
  if(!routes?.length){
      return next(err)
  }
  try {
   const routeReq = proxyURL.pathname
   let route = routes?.find((r)=>r.path == routeReq)
   if(!route){
    if(routes.find((r)=>r.path=="(/*)")){
      route = {destination:routeReq} as typeof routes[0]
    }
    else return next({code:"404"});
   }
   const options = createReqOptions(req,proxyURL,route.destination)
   proxyReq(req,res,options,proxyURL,0)
  } catch (error) {
    logger.error("ERROR_OCCURRED_IN_ROUTE_REQ_HANDLER", error)
    if(res.headersSent){
      return res.end("Proxy Server error")
    }
    return staticResponse(res,503)
  }
}

export default routeReqMiddleware