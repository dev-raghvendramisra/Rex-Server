import { formatObjects, logger } from "@lib";
import { createReadStream } from "fs";
import { access } from "fs/promises";
import  { contentType } from 'mime-types'
import path from "path";
import { Middleware } from "../middlewareIntitializer";

const  staticReqHandler : Middleware = async({req,res,proxyURL,serverInstance : server,next}) => {
  try {
    if(!server.public){
      return next()
    }
    const pathname = proxyURL.pathname=="/" ? "index.html" : proxyURL.pathname
    const filePath = path.join(server.public,pathname)
    const cType = contentType(path.extname(filePath))
    if(!cType){
      return next()
    }
    await access(filePath)
    logger.info(`Getting file ${filePath}`)
    const stream = createReadStream(
      filePath,
      cType.includes('text') ? { encoding: 'utf-8' } : undefined // Binary by default
    );
    res.writeHead(200,"success",{"content-type":cType})
    stream.pipe(res)
    stream.on('error',(err)=>{
      logger.error(`An unexpected error occured while sending the static file ${formatObjects(err)}`)
      if(res.headersSent){
        res.destroy()
      }
      else {
        res.writeHead(500,"internal server error",{"content-type":"text/html"})
        res.end("Internal server error")
      }
     stream.destroy()
    })
  } catch (error : any) {
      if(error.code=="ENOENT"){
       logger.error(`Requested file ${req.url} not found in ${server.public}`)
       res.writeHead(404,"Resource not found",{"content-type":"text/html"})
       res.end("Resource not found")
      }
      else {
        logger.error(`Unexpected error occured in staticReqHandler ${error}`)
        res.writeHead(500,"internal server error",{"content-type":"text/html"})
        res.end("Internal server error")
      }
    }
}

export default staticReqHandler