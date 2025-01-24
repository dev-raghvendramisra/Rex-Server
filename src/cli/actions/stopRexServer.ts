import chalk from "chalk";
import { readPid, writePid } from "@utils";

/**
 * Stops the running Rex server by sending a `SIGTERM` signal to its process.
 * 
 * - If a `processId` is provided in the `options`, it directly uses it to stop the server.
 * - If no `processId` is provided, it reads the PID from the specified `masterProcessIdPath`.
 * - Handles cases where the server is not running or an invalid PID is encountered.
 * 
 * @param {Object} options - Options for stopping the Rex server.
 * @param {number|string} [options.processId] - The PID of the running Rex server. If not provided, the function attempts to read the PID from `masterProcessIdPath`.
 * @param {string} masterProcessIdPath - The file path where the master process's PID is stored.
 * 
 * @throws {Error} If an error occurs while trying to kill the process or read/write the PID file.
 * 
 * @returns {Promise<void>} A promise that resolves when the server is successfully stopped, or logs an appropriate message if the server is not running or an error occurs.
 * 
 * @example
 * // Stop the server using a specific PID
 * stopRexServer({ processId: 12345 }, '/path/to/masterPid')
 *   .then(() => console.log('Rex server stopped successfully'))
 *   .catch(error => console.error('Error stopping Rex server:', error));
 * 
 * @example
 * // Stop the server using the PID from the PID file
 * stopRexServer({}, '/path/to/masterPid')
 *   .then(() => console.log('Rex server stopped successfully'))
 *   .catch(error => console.error('Error stopping Rex server:', error));
 */
export default async function stopRexServer(
  options: { processId?: number | string },
  masterProcessIdPath: string
): Promise<void> {
  try {
    let PID: number | string | undefined;

    if (options.processId) {
      PID = options.processId;
    } else {
      PID = await readPid(masterProcessIdPath);
    }

    if (!PID) {
      console.log(chalk.yellowBright("\n> REX-SERVER IS NOT RUNNING !\n"));
      return;
    }

    // Attempt to terminate the process
    process.kill(Number(PID), "SIGTERM");
    console.log(chalk.yellowBright("\n> REX-SERVER-SHUTDOWN COMPLETED SUCCESSFULLY\n"));

    // Clear the PID from the PID file
    await writePid(masterProcessIdPath, "");
  } catch (error: any) {
    if (error.code === "ESRCH") {
      console.log(chalk.redBright("\n> INVALID PROCESS ID !\n"));
    } else {
      console.log(chalk.redBright(error));
    }
  }
}
