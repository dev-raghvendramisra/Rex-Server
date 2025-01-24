import { fileExporter } from "@utils";
import chalk from "chalk";
import { spawn } from "child_process";
import conf from "conf/conf";

export default async function streamServerLogs(options : any){
    try { 
        if(!options.export){
            console.log(chalk.yellowBright(`\n> Live streaming server logs, press 'ctrl/cmd + c to stop':\n`))
            const logs = spawn('tail',["-f",conf.LOG_FILE_PATH],{
                stdio:["ignore","inherit","inherit"]
            })
            
            logs.on('error',(err)=>{
                console.log(chalk.redBright(`> An error occured while streaming logs ${err}`))
            })
        }
        else {
            const onClose = (destinationFilePath : string) =>{
                console.log(chalk.greenBright(`\n> LOG FILE GENERATED SUCCESSFULLY !\n> You can now check it on this path ${destinationFilePath}\n`))
            }
            const onError = (err : any) =>{
                    if(err.code == "ENOENT"){
                        return console.log(chalk.redBright("\n> Source log file is missing\n> Consider reinstalling Rex-Server\n")) 
                    }
                    else throw new Error(err)
            }
            const onReady = () => {
                    console.log(chalk.yellowBright("\n> Generating log file ..."))
            }
            const destinationFileName = 'server.log'
            fileExporter(conf.LOG_FILE_PATH,destinationFileName,onClose,onError,onReady)
        }
    } catch (error) {
        console.log(chalk.redBright(`> \nAN_ERROR_OCCURED_WHILE_STREAMING_LOGS\n> kindly report this issue here : https://github.com/dev-raghvendramisra/Rex-Server/issues`))
    }
}