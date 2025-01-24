import { fileExporter } from "@utils"
import chalk from "chalk"
import conf from "conf/conf"

export default function initializeRexConfig(){
    const destinationFileName = 'rex.config.yaml'
    const onClose = (destinationFilePath : string)=>{
        console.log(chalk.greenBright(`\n> CONFIG FILE GENERATED SUCCESSFULLY !\n\n> You can now customize it to your needs.\n> To use it, run the following command:\n> rex use ${destinationFilePath}\n`))
    }
    const onError = (err : any) =>{
        if(err.code == "ENOENT"){
            return console.log(chalk.redBright("\n> Source config file is missing\n> Consider reinstalling Rex-Server\n")) 
        }
        else throw new Error(err)
    }
    const onReady = () => {
        console.log(chalk.yellowBright("\n> Generating config file ..."))
    }
    fileExporter(conf.MOCK_CONFIG_PATH,destinationFileName,onClose,onError,onReady)
}