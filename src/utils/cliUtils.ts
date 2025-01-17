import { rex_config } from "@types";

export function parseCliArgs(args:string[],argKey:string):rex_config | false{

    const configArg = args.find((arg)=>{
       return arg.startsWith(argKey)
    })

    if(!configArg){
        return false;
    }
    const config = configArg.split("=")[1]
    if(config){
        return JSON.parse(config)
    }
    return false;
}