import { exec } from 'child_process';
import os from 'os';
import chalk from 'chalk';


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
    console.log(chalk.redBright("> Missing capability: cap_net_bind_service"));
    console.log(chalk.yellowBright("> To bind to privileged ports, run the following command:"));
    console.log(chalk.cyanBright(`> sudo setcap cap_net_bind_service=+ep $(which node)`));
  } else if (platform === 'darwin') {
    console.log(chalk.yellowBright("> On macOS, you need to use sudo to bind to ports below 1024."));
    console.log(chalk.cyanBright("> Try running Rex-Server with sudo, or use a port above 1024."));
  } else if (platform === 'win32') {
    console.log(chalk.yellowBright("> On Windows, you may need to run your terminal as Administrator."));
    console.log(chalk.cyanBright("> Run the command prompt or terminal as Administrator to bind to privileged ports."));
  } else {
    console.log(chalk.yellowBright("> Unsupported platform. Please refer to your OS documentation for more information."));
  }
}



