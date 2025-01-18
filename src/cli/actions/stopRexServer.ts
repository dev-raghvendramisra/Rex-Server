import chalk from "chalk";
import {readPid,writePid} from '@utils';
/**
 * Stops the running Rex server by sending a `SIGTERM` signal to the process identified by its PID.
 * If no PID is provided in the options, it reads the PID from the `masterProcessIdPath` file.
 * If the server is not running or the PID is invalid, appropriate messages are logged.
 * 
 * @param {Object} options - Options for stopping the Rex server.
 * @param {number|string} [options.processId] - The PID of the running Rex server. If not provided, the function reads the PID from the `masterProcessIdPath` file.
 * @param {string} masterProcessIdPath - The file path where the master process's PID is stored.
 * 
 * @throws {Error} If an error occurs while trying to kill the process or reading the PID.
 * 
 * @returns {Promise<void>} A promise that resolves when the server is successfully stopped, or rejects if an error occurs.
 * 
 * @example
 * import stopRexServer from './stopRexServer';
 * 
 * stopRexServer({ processId: 12345 }, '/path/to/masterPid')
 *   .then(() => console.log('Rex server stopped successfully'))
 *   .catch(error => console.error('Error stopping Rex server:', error));
 */
export default async function stopRexServer(options : any, masterProcessIdPath : string) {
  try {
      let PID;
      if (options.processId) {
          PID = options.processId;
      } else {
          PID = await readPid(masterProcessIdPath);
      }

      if (!PID) {
          return console.log(chalk.yellowBright("\n> Rex Server is not running !\n"));
      }

      process.kill(Number(PID), 'SIGTERM');
      console.log(chalk.yellowBright("\n> REX-SERVER-SHUTDOWN COMPLETED SUCCESSFULLY\n"));
      await writePid(masterProcessIdPath, "");
      
  } catch (error : any) {
      if (error.code === "ESRCH") {
          return console.log(chalk.redBright("\n> INVALID PROCESS ID !\n"));
      }
      console.log(chalk.redBright(error));
  }
}
