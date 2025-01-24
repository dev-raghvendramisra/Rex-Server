import { IPCERRMessage, IPCINFOMessage, IPCINFOMessgeName, REX_CONFIG } from "@types";
import cluster from "cluster";
import {cpus} from 'os'
import { terminateMasterProcess } from "./terminateMasterProcess";
import { handleMemErr, handlePortErr, handleSSlErr, informParentAboutEvt, rexServerReady } from "@utils";
import { logger } from "@lib";


/**
 * Starts the master process of the Rex server, which is responsible for managing worker processes.
 * The master process forks a number of worker processes based on the server configuration, 
 * handles incoming messages from workers, and handles shutdowns in case of errors.
 * 
 * @param {REX_CONFIG} config - The configuration for the server, including the number of workers and the ports to listen on.
 * 
 * @throws {Error} Will throw an error if a worker process fails to start or the configuration is invalid.
 * 
 * @example
 * startMasterProcess({
 *   server: { listen: [80] },
 *   workers: "auto",
 *   upstream: { servers: [{ host: 'http://localhost:8000' }] }
 * });
 */


export function startMasterProcess(config : REX_CONFIG){
   const workerCount =  config.workers == "auto" ? cpus().length : config.workers
   let shutdown = false;
   let readyWorkers = 0;

   for(let i=0;i<workerCount;i++){
      cluster.fork()
   }

   cluster.on('online',(w)=>{
      logger.info(`🛠️  Worker process ${w.id} started`)
   })

   

   cluster.on('message',async(worker,message:IPCERRMessage | IPCINFOMessage)=>{
       if(message.type=="error"){
         const error = message.data
         const portError = await handlePortErr(error)
         if(portError && portError.needTermination){
            shutdown = true
            informParentAboutEvt<IPCERRMessage>({
               type:"error",
               data:{
                  code:error.code,
                  message:`REX-STARTUP-FAILED\n>${portError.errMsg}`
               }
            })
            return terminateMasterProcess(cluster)
         }
         const memError = await handleMemErr(error)
         if(memError && memError.needTermination){
            shutdown=true
            return terminateMasterProcess(cluster)
         }
         const sslError = await handleSSlErr(error)
         if(sslError && sslError.needsTermination){
            shutdown=true
            informParentAboutEvt<IPCERRMessage>({
               type:"error",
               data:{
                  code : error.code,
                  message:`REX-STARTUP-FAILED\n${sslError.errMsg}`
               }
            })
            return terminateMasterProcess(cluster)
         }
         else worker.kill('SIGTERM') 
       }
       else{
          if(message.name==IPCINFOMessgeName.RESTART){
            worker.kill('SIGTERM')
          }
          else if(message.name==IPCINFOMessgeName.READY){
              readyWorkers++;
              if(readyWorkers == workerCount){
                rexServerReady()
              }
          }
       }

   })



   cluster.on('exit',(w)=>{
    if(!shutdown){
      logger.error(`🛠️  WORKER_PROCESS_(${w.id})_DIED.`)
       cluster.fork()
    }
   })

   logger.info("🧠 Master process started")

   process.on('SIGTERM', () => {
      shutdown=true
      terminateMasterProcess(cluster)
    });
}
