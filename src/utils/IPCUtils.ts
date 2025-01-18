import { IPCINFOMessage, IPCINFOMessgeName } from "@types";
import { Worker } from "cluster";

/**
 * Informs the master process that the worker process is ready to handle requests.
 * 
 * This function sends an `IPCINFOMessage` to the master process to indicate that the server startup is complete.
 * 
 * @example
 * rexServerReady();
 */
export function rexServerReady(){
    informParentAboutEvt<IPCINFOMessage>({
        type:"info",
        name:IPCINFOMessgeName.READY,
        message:"REX-STARTUP-COMPLETE"
    })
}

/**
 * Informs the master process that a specific worker is ready.
 * 
 * This function sends an `IPCINFOMessage` to the master process, indicating that a worker is ready.
 * 
 * @param {Worker} w - The worker process that is ready.
 * 
 * @example
 * workerReady(cluster.worker);
 */
export function workerReady(w : Worker){
    informMasterAboutEvt<IPCINFOMessage>(
        {
            type:"info",
            message:`Worker ${w.id} is ready`,
            name:IPCINFOMessgeName.READY
       }
    )
}

/**
 * Sends an event message to the master process.
 * 
 * @param {T} message - The message to send to the master process.
 * 
 * @example
 * informMasterAboutEvt({ type: "info", message: "Worker is ready" });
 */
export function informMasterAboutEvt<T>(message:T){
   process.send && (process.send as (arg:T)=>void)(
    message
   )
}

/**
 * Sends an event message to the parent process (typically the terminal).
 * 
 * @param {T} message - The message to send to the parent process.
 * 
 * @example
 * informParentAboutEvt({ type: "error", message: "Worker failed" });
 */
export function informParentAboutEvt<T>(message:T){
    (console.error as (arg:T)=>void)(
       JSON.stringify(message) as T
    )
}

