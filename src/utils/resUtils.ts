import { staticReqHandler } from "@controller";
import { formatObjects, logger } from "@lib";
import { ProxyURL, REX_CONFIG, ServerInstance } from "@types";
import conf from "conf/conf";
import { createReadStream, ReadStream, WriteStream } from "fs";
import { IncomingMessage, ServerResponse } from "http";
import path from "path";
import { Middleware } from "worker/server/middlewareIntitializer";

export function getDefaultHeaders(){
    return {
        "X-Powered-By":"Rex-Server",
        "Server":"Rex-Server"
    }
}




export const welcomeRes : Middleware =(props)=>{ 
    const newServerInstance = {...props.serverInstance,public:conf.STATIC_DIR_PATH}
    if(props.req.url=="/"){
        props.proxyURL.pathname = "/welcome.html"
    }
    return staticReqHandler({...props,serverInstance:newServerInstance})
}