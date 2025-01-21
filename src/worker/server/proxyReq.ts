import {IncomingMessage, RequestOptions, ServerResponse, ClientRequest } from "http"
import { logger } from "@lib"
import { createHttpReq, createHttpsReq, createReqOptions, handleRedirects } from "utils/reqUtils"
import { ProxyURL } from "@types";

let maxRedirect = 5;

export default async function proxyRequest(req:IncomingMessage,res:ServerResponse,options:RequestOptions, proxyURL : ProxyURL, crrRedirects=0){
  handleRedirects(maxRedirect,res,crrRedirects)
  let proxyReq : ClientRequest;


  const proxyReqHandler = (proxyRes:IncomingMessage)=>{
      if(proxyRes.headers.location && proxyRes.headers.location.includes("https")){
         const newOptions = createReqOptions(req,proxyURL,proxyRes.headers.location)
         logger.info(`Redirection detected, redirecting to ${proxyRes.headers.location}`)
         return proxyRequest(req,res,newOptions,proxyURL,crrRedirects)
      }
      res.writeHead(proxyRes.statusCode as number, proxyRes.statusMessage, proxyRes.headers)
      return proxyRes.pipe(res)
  }
  
  if(options.protocol=="https:"){
       proxyReq = createHttpsReq(options,proxyReqHandler)
  }
  else{
   logger.info("Protocol is http")
   proxyReq = createHttpReq(options,proxyReqHandler)
  }
   req.pipe(proxyReq)
   proxyReq.on('error',(err)=>{
      logger.error(`Error sending proxyReq for ${options.host} : ${err}`)
      res.writeHead(500,"Internal server error",{"content-type":"text/html"})
      res.end("Internal server error")
   })
   return proxyReq
}

