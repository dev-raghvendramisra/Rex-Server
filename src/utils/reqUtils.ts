import { ClientRequest, IncomingMessage, OutgoingHttpHeader, RequestListener, ServerResponse } from "http";
import { request as httpsRequest, RequestOptions } from "https";
import { request as httpRequest } from "http";
import { URL } from "url";
import { formatObjects, logger } from "@lib";
import { ProxyURL } from "@types";
import path from "path";
import { constants, createReadStream } from "fs";
import { contentType } from "mime-types";
import { TLSSocket } from "tls";
import { access } from "fs/promises";

export function createReqOptions(req : IncomingMessage,proxyURL:URL,destination:string) : RequestOptions{
    let destURL = getURL(destination)
    const options : RequestOptions = {
        headers:getReqHeaders(req),
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

 export async function getCtypeAndStream(pathname : string, staticDir:string){
    const filePath = path.resolve(staticDir,pathname)
    const cType = contentType(path.extname(filePath))
    if(!cType){
        return null
    }
    try {
        await access(filePath,constants.R_OK)
    } catch (error) {
        return null;
    }
    const stream = createReadStream(filePath,cType.includes("text") ?{encoding : 'utf-8' }: undefined)
    return {
        cType,
        stream
    }
 }

 const hopByHopHeaders = [
    "connection",
    "upgrade",
    "keep-alive",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
];

 export function getReqHeaders(req : IncomingMessage){
    const headers = Object.fromEntries(
        Object.entries(req.headers).filter(([key]) => !hopByHopHeaders.includes(key.toLowerCase()))
    );
    return {
        ...headers,
        "Via":`1.1 ${req.headers.host}`,
        "X-Forwarded-For":req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        "X-Forwarded-Host": req.headers.host,
        "X-Forwarded-Proto": req.socket instanceof TLSSocket ? "https" : "http",
        "X-Forwarded-Port": req.socket.localPort
    }
}
