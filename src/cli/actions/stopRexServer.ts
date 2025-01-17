import {readFile,writeFile} from 'fs/promises'
import chalk from "chalk";

export default async function stopRexServer(options : any,masterProcessIdPath:string){
    try {
        let PID;
        if(options.processId){
            PID = options.processId
        }
        else PID = await readFile(masterProcessIdPath,'utf-8')
        const res = process.kill(Number(PID),'SIGINT')
        if(res){
           console.log(chalk.yellowBright("\n> REX-SERVER-SHUTDOWN COMPLETED SUCCESSFULLY\n"))
           await writeFile(masterProcessIdPath,"")
        }
        else {
          console.log(chalk.redBright("> Invalid process id !"))
        }
        } catch (error : any) {
           if(error.code == "ENOENT") {
             console.log(chalk.yellowBright("> Rex Server is not running !"))
           }
           else {
            console.log(chalk.redBright("> Failed to stop the Rex-Server !"))
           }
        }
}