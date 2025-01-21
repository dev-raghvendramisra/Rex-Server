import { ClientRequest, IncomingMessage, RequestListener, ServerResponse } from "http";
import { request as httpsRequest, RequestOptions } from "https";
import { request as httpRequest } from "http";
import { URL } from "url";
import { formatObjects, logger } from "@lib";
import { ProxyURL } from "@types";

export function createReqOptions(req : IncomingMessage,proxyURL:URL,destination:string) : RequestOptions{
    let destURL = getURL(destination)
    const options : RequestOptions = {
        headers:{...req.headers,host:destURL.hostname},
        method:req.method,
        port:destURL.protocol=="https:"?443:destURL.port || 80,
        host:destURL.host,
        protocol:destURL.protocol,
        hostname:destURL.hostname,
        path:proxyURL.pathname+proxyURL.search,
    }
    logger.info(`Request options : ${formatObjects(options)}`)
    return options;
}

export function createHttpsReq(options:RequestOptions,reqHandler:(res:IncomingMessage)=>void ) : ClientRequest{
    const proxyReq = httpsRequest(options)
    proxyReq.on('response',reqHandler)
    return proxyReq
 }
 
 export function createHttpReq(options:RequestOptions,reqHandler:(res:IncomingMessage)=>void) : ClientRequest{
    const proxyReq = httpRequest(options)
    proxyReq.on('response',reqHandler)
    return proxyReq
 }

 export function handleRedirects(maxRedirect:number,res:ServerResponse,crrRedirect:number){
   crrRedirect++;
   if(crrRedirect>maxRedirect){
    res.writeHead(303,{"content-type":"text/html"})
    return res.end("Too many redirects")
   }
 }

 export function getURL(url:string,path?:string){
     if(url.startsWith("localhost")){
        url=`http://${url}`
     }
     return new ProxyURL(url,path)
 }
 