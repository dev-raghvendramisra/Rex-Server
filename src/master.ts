import { rex_config } from "@types";
import cluster from "cluster";
import {cpus} from 'os'

export default function startMasterProcess(config : rex_config){
   const workerCount =  config.workers == "auto" ? cpus().length : config.workers
   console.log(workerCount)
   for(let i=0;i<workerCount;i++){
      cluster.fork()
   }
   cluster.setupPrimary()
   
   cluster.on('fork',(w)=>{
      console.log(`Wroker with ${w.id} started.`)
   })
   cluster.on('exit',(w)=>{
    console.log(`Wroker with ${w.id} died. Starting new one..`)
    cluster.fork()
   })
   console.log("Master process started..")
   process.on('SIGINT', () => {
      console.log('Master process shutting down...');
      for (const id in cluster.workers) {
        cluster.workers[id]?.kill('SIGINT');
      }
      process.exit();
    });
}
