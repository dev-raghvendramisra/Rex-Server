import { access, readFile, writeFile } from "fs/promises";

/**
 * Writes the Process ID (PID) to a specified file.
 * 
 * This function first checks if the PID file exists. If the file exists, it writes the provided
 * PID value to the file.
 * 
 * @param {string} processIdPath - The file path where the PID will be stored.
 * @param {string} pid - The Process ID to write to the file.
 * @returns {Promise<void>} - A promise that resolves when the file is written successfully.
 * @throws {Error} Will throw an error if the file doesn't exist or if the write operation fails.
 */
export async function writePid(processIdPath: string, pid: string): Promise<void> {
  await doesPidExists(processIdPath);
  const written = await writeFile(processIdPath, pid, 'utf-8');
  return written;
}

/**
 * Reads the Process ID (PID) from a specified file.
 * 
 * This function first checks if the PID file exists. If the file exists, it reads the PID 
 * stored in the file and returns it.
 * 
 * @param {string} processIdPath - The file path where the PID is stored.
 * @returns {Promise<string>} - A promise that resolves with the PID stored in the file.
 * @throws {Error} Will throw an error if the file doesn't exist or if the read operation fails.
 */
export async function readPid(processIdPath: string): Promise<string> {
  await doesPidExists(processIdPath);
  const pid = await readFile(processIdPath, 'utf-8');
  return pid;
}

/**
 * Checks if the PID file exists at the specified path.
 * 
 * This function checks for the existence of a PID file. If the file does not exist, it throws
 * an error with guidance on what the user should do next to resolve the issue.
 * 
 * @param {string} processIdPath - The file path to check for the PID file.
 * @returns {Promise<void>} - A promise that resolves if the file exists, otherwise throws an error.
 * @throws {Error} Will throw an error if the file doesn't exist.
 */
export async function doesPidExists(processIdPath: string): Promise<void> {
  try {
    await access(processIdPath); // Check if the file exists
  } catch (error: any) {
    if (error.code == "ENOENT") {
      throw new Error(`> The PID file is missing. Please follow these steps to resolve the issue:\n> 1. Restart your machine to clear all processes.\n> 2. Terminate all Node.js processes running on your system (Recommended)\n> Command: ps aux | grep node | awk '{print $2}' | xargs kill\n\n> If the issue persists after performing the above steps, consider reinstalling the Rex-Server. \n> Terminating Node.js processes is recommended if you are unsure.\n\n> For more information, refer to our documentation: https://github.com/dev-raghvendramisra/Rex-Server \n\n> After completing these steps, you can resume normal operation.
      `);
    }
  }
}
