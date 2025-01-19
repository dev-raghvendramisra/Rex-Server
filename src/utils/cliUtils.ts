import { exec } from 'child_process';
import os from 'os';
import chalk from 'chalk';
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



/**
 * Checks if the current process has the necessary privileges to bind to privileged ports.
 * On Linux systems, binding to ports below 1024 requires elevated privileges.
 * 
 * @returns {Promise<boolean>} A promise that resolves to `true` if the process has the necessary privileges, or `false` otherwise.
 * 
 * @example
 * checkPortPrivilege().then((hasPriv) => {
 *   if (hasPriv) {
 *     console.log("Process has port binding privileges.");
 *   } else {
 *     console.log("Process does not have port binding privileges.");
 *   }
 * });
 */
export function checkPortPrivilege(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (os.platform() === 'linux') {
      exec('getcap $(which node)', (err, stdout, stderr) => {
        if (err) {
          reject(stderr);
        }
        if (stdout.includes('cap_net_bind_service')) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    } else {
      resolve(false);
    }
  });
}

/**
 * Provides instructions on how to obtain the required port binding privileges based on the OS platform.
 * 
 * @example
 * provideInstructions();
 */
export function provideInstructions() {
    const platform = os.platform();

    if (platform === 'linux') {
        throw new Error(`> Missing capability: cap_net_bind_service\n> To bind to privileged ports, run the following command:\n> sudo setcap cap_net_bind_service=+ep $(which node)
        `);
    } else if (platform === 'darwin') {
        throw new Error(`> On macOS, you need to use sudo to bind to ports below 1024.\> Try running Rex-Server with sudo, or use a port above 1024.
        `);
    } else if (platform === 'win32') {
        throw new Error(`> On Windows, you may need to run your terminal as Administrator.\n> Run the command prompt or terminal as Administrator to bind to privileged ports.
        `);
    } else {
        throw new Error(`> Unsupported platform. Please refer to your OS documentation for more information.
        `);
    }
}



