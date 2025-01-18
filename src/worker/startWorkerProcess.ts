import { IPCERRMessage, NodeJsErr, REX_CONFIG } from "@types";
import https,{Server as HttpsServer} from 'https'
import http,{Server as HttpServer} from 'http'
import cluster, { Worker } from "cluster";
import { logger } from "@lib";
import {informMasterAboutEvt, workerReady } from "@utils";

/**
 * Starts a worker process that handles HTTP and HTTPS requests on the specified ports.
 * 
 * This function creates HTTP and/or HTTPS servers based on the configuration and binds them to the specified ports.
 * It also handles uncaught exceptions and forwards errors to the master process.
 * 
 * @param {REX_CONFIG} config - The configuration for the worker, including the ports to listen on and SSL settings.
 * 
 * @example
 * startWorkerProcess({
 *   server: { listen: [80, 443] },
 *   sslConfig: { cert: 'path/to/cert', key: 'path/to/key' },
 * });
 */
export function startWorkerProcess(config : REX_CONFIG){
    const ports = config.server.listen 
    type serverType = HttpServer | HttpsServer
    const servers : serverType[] = []
    let readServers = 0;

    ports.forEach((port)=>{
        if(port==443){
            const httpsServer = https.createServer({
              cert:config.sslConfig?.cert,
              key:config.sslConfig?.key
            },(req,res)=>{
               res.writeHead(200,{"Content-Type":"text/plain"})
               res.end("Hello from Worker process with pid: "+process.pid)
            })

            httpsServer.listen(port,()=>{
                readServers++
                if(readServers==ports.length){
                    workerReady(cluster.worker as Worker)
                }
            })
            servers.push(httpsServer)
        }
        const httpServer = http.createServer((req,res)=>{
            res.writeHead(200)
            res.end("Hello from Worker process with pid: "+process.pid+"\n")
        })
        httpServer.listen(port,()=>{
            readServers++
            if(readServers==ports.length){
                workerReady(cluster.worker as Worker)
            }
        })
        servers.push(httpServer)
    })

    servers.forEach((server)=>{
        server.on('error',(err : unknown)=>{
            informMasterAboutEvt<IPCERRMessage>(
                {
                    type:"error",
                    data:err as NodeJsErr
                }
            )
        })

    })

    process.on('uncaughtException',(err : unknown)=>{
        informMasterAboutEvt<IPCERRMessage>(
            {
                type:"error",
                data:err as NodeJsErr
            }
        )
    })

    process.on('SIGTERM',()=>{
       logger.warn(`🛠️  Worker process ${cluster.worker?.id} shutting down ..`)
       process.exit()
    })
}