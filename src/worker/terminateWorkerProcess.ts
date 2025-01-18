import { Worker } from "cluster";

/**
 * Terminates a worker process by sending a `SIGTERM` signal.
 * 
 * @param {Worker} worker - The worker process to terminate.
 * 
 * @example
 * terminateWorkerProcess(worker);
 */
export  function terminateWorkerProcess(worker:Worker){
   worker.kill('SIGTERM')
}