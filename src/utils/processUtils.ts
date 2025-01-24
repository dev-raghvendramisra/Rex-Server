import { access, readFile, writeFile } from "fs/promises";

/**
 * Writes the Process ID (PID) to a specified file.
 * 
 * This function checks if the PID file exists. If it does, it writes the provided PID value to the file.
 * The operation is done asynchronously, and a promise is returned to indicate the completion of the task.
 * 
 * @param {string} processIdPath - The file path where the PID will be stored.
 * @param {string} pid - The Process ID to write to the file.
 * @returns {Promise<void>} - A promise that resolves when the file has been written successfully.
 * 
 * @throws {Error} Will throw an error if the PID file doesn't exist or if the write operation fails.
 * 
 * @example
 * writePid("/path/to/pidfile.pid", "12345")
 *   .then(() => console.log("PID written successfully"))
 *   .catch(error => console.error("Error writing PID:", error));
 */
export async function writePid(processIdPath: string, pid: string): Promise<void> {
  await doesPidExists(processIdPath);  // Ensure the file exists before writing.
  const written = await writeFile(processIdPath, pid, 'utf-8');
  return written;
}

/**
 * Reads the Process ID (PID) from a specified file.
 * 
 * This function checks if the PID file exists, and if so, reads the PID value stored in the file.
 * The read operation is asynchronous and returns a promise that resolves with the PID string.
 * 
 * @param {string} processIdPath - The file path where the PID is stored.
 * @returns {Promise<string>} - A promise that resolves with the PID string stored in the file.
 * 
 * @throws {Error} Will throw an error if the file doesn't exist or if the read operation fails.
 * 
 * @example
 * readPid("/path/to/pidfile.pid")
 *   .then(pid => console.log("PID:", pid))
 *   .catch(error => console.error("Error reading PID:", error));
 */
export async function readPid(processIdPath: string): Promise<string> {
  await doesPidExists(processIdPath);  // Ensure the file exists before reading.
  const pid = await readFile(processIdPath, 'utf-8');
  return pid;
}

/**
 * Checks if the PID file exists at the specified path.
 * 
 * This function checks the existence of the PID file at the specified path. If the file doesn't exist,
 * it throws an error with instructions on how to resolve the issue, including steps to restart processes or reinstall the server.
 * 
 * @param {string} processIdPath - The file path to check for the PID file.
 * @returns {Promise<void>} - A promise that resolves if the file exists, otherwise throws an error.
 * 
 * @throws {Error} Will throw an error if the file doesn't exist, with troubleshooting instructions.
 * 
 * @example
 * doesPidExists("/path/to/pidfile.pid")
 *   .then(() => console.log("PID file exists"))
 *   .catch(error => console.error("Error:", error));
 */
export async function doesPidExists(processIdPath: string): Promise<void> {
  try {
    await access(processIdPath);  // Check if the file exists.
  } catch (error: any) {
    if (error.code == "ENOENT") {
      throw new Error(`> The PID file is missing. Please follow these steps to resolve the issue:\n> 1. Restart your machine to clear all processes.\n> 2. Terminate all Node.js processes running on your system (Recommended)\n> Command: ps aux | grep node | awk '{print $2}' | xargs kill\n\n> If the issue persists after performing the above steps, consider reinstalling the Rex-Server. \n> Terminating Node.js processes is recommended if you are unsure.\n\n> For more information, refer to our documentation: https://github.com/dev-raghvendramisra/Rex-Server \n\n> After completing these steps, you can resume normal operation.`);
    }
  }
}
