import chalk from "chalk";
import conf from "conf/conf";
import { createReadStream, createWriteStream } from "fs"

export default async function initializeRexConfig(){
    try {
    const cwd = process.cwd()
    const destinationFile = createWriteStream(cwd+"/rex.config.yaml",'utf-8');
    const sourceFile = createReadStream(conf.MOCK_CONFIG_PATH,'utf-8');
    console.log(chalk.yellowBright("\n> Generating rex.config.yaml ..."))
    sourceFile.pipe(destinationFile)
    destinationFile.on('close',()=>{
       console.log(chalk.greenBright(`\n> CONFIG FILE GENERATED SUCCESSFULLY !\n\n> You can now customize it to your needs.\n> To use it, run the following command:\n> rex use ${destinationFile.path}\n`))
    })
    sourceFile.on('error',(err:any)=>{
        if(err.code == "ENOENT"){
            return console.log(chalk.redBright("\n> Source config file is missing\n> Consider reinstalling Rex-Server\n")) 
        }
        else throw new Error(err)
    })
    } catch (error : any) {
       return console.log(chalk.redBright("> Unexpected error occured while generating the config file\n> Please report this issue here https://github.com/dev-raghvendramisra/Rex-Server/issues"))
    }
}