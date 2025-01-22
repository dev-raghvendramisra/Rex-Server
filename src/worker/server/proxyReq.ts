import {IncomingMessage, RequestOptions, ServerResponse, ClientRequest } from "http"
import { logger } from "@lib"
import { createHttpReq, createHttpsReq, createReqOptions, handleRedirects } from "utils/reqUtils"
import { ProxyURL } from "@types";
import { getResHeaders, handleResPipingError, staticResponse } from "@utils";

let maxRedirect = 5;

export default async function proxyRequest(req:IncomingMessage,res:ServerResponse,options:RequestOptions, proxyURL : ProxyURL, crrRedirects=0){
  handleRedirects(maxRedirect,res,crrRedirects)
  let proxyReq : ClientRequest;


  const proxyReqHandler = (proxyRes:IncomingMessage)=>{
      if(proxyRes.headers.location && proxyRes.headers.location.includes("https")){
         const newOptions = createReqOptions(req,proxyURL,proxyRes.headers.location)
         return proxyRequest(req,res,newOptions,proxyURL,crrRedirects)
      }
      res.writeHead(proxyRes.statusCode as number, proxyRes.statusMessage, getResHeaders(undefined,proxyRes))
      proxyRes.pipe(res)
      return handleResPipingError(res,proxyRes)
  }
  
  if(options.protocol=="https:"){
       proxyReq = createHttpsReq(options,proxyReqHandler)
  }
  else{
   proxyReq = createHttpReq(options,proxyReqHandler)
  }
   req.pipe(proxyReq)
   proxyReq.on('error',(err : any)=>{
      logger.error(`ERROR_SENDING_PROXYREQ_FOR_${options.host} : ${err}`)
      if(res.headersSent){
         res.end("Proxy server error")
      }
      else if(err.code == "ECONNREFUSED" || err.code === 'ETIMEDOUT'){
         staticResponse(res,502)
      }
      
      else {
         staticResponse(res,503)
      }
   })
   return proxyReq
}

