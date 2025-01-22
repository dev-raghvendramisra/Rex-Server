import { formatObjects, logger } from "@lib";
import { Middleware } from "../middlewareIntitializer";
import { getResHeaders, getCtypeAndStream, handleResPipingError, staticResponse } from "@utils";

const  staticReqMiddleware : Middleware = async({res,proxyURL,serverInstance : server,next}) => {
  try {
    if(!server.public){
      return next()
    }
    const pathname = proxyURL.pathname=="/" ? "index.html" : proxyURL.pathname
    const ctypeAndStream = await getCtypeAndStream(pathname,server.public)
    if(!ctypeAndStream){
       return next({code:"404"})
    }
    const {stream, cType} = ctypeAndStream
    res.writeHead(200,"success",getResHeaders(cType))
    stream.pipe(res)
    handleResPipingError(res,stream,server.public)
    
  } catch (error : any) {
    logger.error(`UNEXPECTED_ERROR_OCCURED_IN_STATIC_REQ_HANDLER ${formatObjects(error)}`)
        if(res.headersSent){
          return res.end("Proxy server error")
        }
        staticResponse(res,503)
    }
}

export default staticReqMiddleware