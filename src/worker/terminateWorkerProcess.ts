import { Worker } from "cluster";

/**
 * Terminates a worker process by sending a `SIGTERM` signal to gracefully shut it down.
 * 
 * The `SIGTERM` signal is used to request a graceful termination of the worker process.
 * This function ensures that the worker is killed cleanly and any necessary shutdown processes can be handled.
 * 
 * @param {Worker} worker - The worker process to terminate. The worker should be a valid instance of the Node.js `Worker` class from the `cluster` module.
 * 
 * @throws {Error} If the worker process is invalid or not an instance of the `Worker` class.
 * 
 * @example
 * // Example usage:
 * const worker = cluster.fork();
 * terminateWorkerProcess(worker);
 */
export function terminateWorkerProcess(worker: Worker) {
  if (!(worker instanceof Worker)) {
    throw new Error("Invalid worker process. Expected an instance of the Worker class.");
  }

  worker.kill('SIGTERM');
}
