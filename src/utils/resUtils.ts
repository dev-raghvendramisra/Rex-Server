import conf from "conf/conf";
import { access } from "fs/promises";
import path from "path";
import { getCtypeAndStream } from "./reqUtils";
import { constants, ReadStream } from "fs";
import { handleResPipingError } from "./errUtils";
import { IncomingMessage, ServerResponse } from "http";
import { formatObjects, logger } from "@lib";

export function getResHeaders(contentType ?: string,res ?: IncomingMessage){
    const headers = {
        ...res?.headers,
        "X-Powered-By":"Rex-Server",
        "Server":"Rex-Server"
    }
    if (contentType) headers["content-type"] = contentType
    return headers
}

export const staticResponse = async(res:ServerResponse ,code = 200)=>{
    try {
        let fileName : string;
        let statusMessage : string;
         switch(code){
              case 200:
              fileName = "welcome.html";
              statusMessage = "Success";
              break;
              
              case 404:
              fileName = "404.html"
              statusMessage = "Resource not found";
              break;
              
              case 502:
              fileName = "502.html"
              statusMessage = "Bad gateway";
              break;
    
             default:
             fileName = "503.html"
             statusMessage = "Service unavailable";
         }
         const ctypeAndStream = await getCtypeAndStream(fileName,conf.STATIC_DIR_PATH)
         if(!ctypeAndStream){
            throw new Error("File not found")
         }
         const {stream, cType} = ctypeAndStream
        if(!res.headersSent){
          res.writeHead(code,statusMessage,getResHeaders(cType))
        }
        stream.pipe(res)
        handleResPipingError(res,stream,conf.STATIC_DIR_PATH)   
    } catch (err) {
         logger.error(`ERROR_IN_SERVING: ${formatObjects(err as Object)}`)
         res.writeHead(503,"Service unavailable",{"content-type":"text/html"})
         res.end("<h1>Rex Proxy server error</h1>")
    }
    
}