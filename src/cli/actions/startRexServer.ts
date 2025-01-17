import chalk from "chalk";
import { spawn } from "child_process";
import configParser from "configParser";
import { writeFile } from "fs/promises";
import path from "path";
import { checkPortPrivilege, provideInstructions } from "scripts/checkPrivileges";


export default async function startRexServer(masterPidPath : string,configPath?:string,){
    if(!configPath){
        configPath  = path.resolve(__dirname,'../../../','rex.config.yaml')
    }
    try {
        const hasPrives = await checkPortPrivilege()
        if(hasPrives){
           return provideInstructions()
        }
        const config = await configParser(configPath)
        const jsonConfig = JSON.stringify(config)
        const masterProcess = spawn('node',['dist/server.js',`--config=${jsonConfig}`],{
            detached:true,
            stdio:["ignore","inherit","pipe"]
        })
        const masterPID = masterProcess.pid as number
        await writeFile(masterPidPath,`${masterPID}`)
                
        masterProcess.stderr.on('data',(INTERRUPT)=>{
            if(INTERRUPT.toString().trim() == "REX-SETUP-COMPLETE"){
                console.log(chalk.green("\n> REX-SERVER STARTUP COMPLETED SUCCESSFULLY\n"))
                process.exit(0)
            }
        })
    } catch (error) {
        console.log(chalk.redBright(`> Error starting Rex-Server server : ${error}`))
        process.exit(1)
    }
}