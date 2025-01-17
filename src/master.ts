import { rex_config } from "@types";
import chalk from "chalk";
import cluster from "cluster";
import {cpus} from 'os'

export default function startMasterProcess(config : rex_config){
   const workerCount =  config.workers == "auto" ? cpus().length : config.workers
   let shutdown = false;

   for(let i=0;i<workerCount;i++){
      cluster.fork()
   }

   cluster.on('fork',(w)=>{
      console.log(chalk.greenBright(`🛠️  Worker process ${w.id} started`))
      if(w.id==workerCount){
         console.error("REX-SETUP-COMPLETE")
      }
   })


   cluster.on('exit',(w)=>{
    if(!shutdown){
       console.log(chalk.redBright(`🛠️  Worker process ${w.id} died.`))
       cluster.fork()
    }
   })

   console.log(chalk.greenBright("\n🧠 Master process started"))

   process.on('SIGINT', () => {
      console.log(chalk.yellowBright("\n🧠 Master process shutting down..."));
      for (const id in cluster.workers) {
        cluster.workers[id]?.kill('SIGINT')
         console.log(chalk.yellowBright(`🛠️  Worker process ${id} shutting down ..`))
        }
      process.exit();
    });
}
