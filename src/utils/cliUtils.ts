import { REX_CONFIG } from "@types";

/**
 * Parses the command-line arguments to extract the configuration.
 * 
 * This function looks for an argument with the specified key (e.g., `--config`) and 
 * returns the parsed configuration if found.
 * 
 * @param {string[]} args - The command-line arguments.
 * @param {string} argKey - The key to search for in the arguments (e.g., `--config`).
 * @returns {REX_CONFIG | false} The parsed configuration if the argument is found, or `false` otherwise.
 * 
 * @example
 * const config = parseCliArgs(process.argv, '--config');
 * if (config) {
 *   console.log(config);
 * }
 */
export function parseCliArgs(args:string[],argKey:string):REX_CONFIG | false{

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