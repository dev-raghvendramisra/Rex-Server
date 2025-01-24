import { IPCINFOMessage, IPCINFOMessgeName } from "@types";
import { Worker } from "cluster";

/**
 * Informs the master process that the worker process is ready to handle requests.
 * 
 * This function sends an `IPCINFOMessage` to the master process to indicate that the server startup is complete.
 * The message includes a "READY" status to notify that the worker is ready to begin handling requests.
 * 
 * @example
 * rexServerReady();
 */
export function rexServerReady() {
    informParentAboutEvt<IPCINFOMessage>({
        type: "info",
        name: IPCINFOMessgeName.READY,
        message: "REX-STARTUP-COMPLETE"
    });
}

/**
 * Informs the master process that a specific worker is ready.
 * 
 * This function sends an `IPCINFOMessage` to the master process, indicating that a worker has started and is ready 
 * to handle requests. It includes the worker's ID and a message to notify the master.
 * 
 * @param {Worker} w - The worker process that is ready.
 * 
 * @example
 * workerReady(cluster.worker);
 */
export function workerReady(w: Worker) {
    informMasterAboutEvt<IPCINFOMessage>({
        type: "info",
        message: `Worker ${w.id} is ready`,
        name: IPCINFOMessgeName.READY
    });
}

/**
 * Sends an event message to the master process.
 * 
 * This function sends an event message to the master process (usually in the cluster). The message can be any type 
 * of event, such as worker readiness or other informational messages, allowing the master process to monitor the 
 * status of its workers.
 * 
 * @param {T} message - The message to send to the master process. This could contain any relevant event data.
 * 
 * @example
 * informMasterAboutEvt({ type: "info", message: "Worker is ready" });
 */
export function informMasterAboutEvt<T>(message: T) {
    process.send && (process.send as (arg: T) => void)(message);
}

/**
 * Sends an event message to the parent process (typically the terminal).
 * 
 * This function sends an event message to the parent process (often the terminal or console), typically used for logging 
 * or error reporting purposes. The message is serialized to JSON format before being sent.
 * 
 * @param {T} message - The message to send to the parent process. This is usually an error or status message.
 * 
 * @example
 * informParentAboutEvt({ type: "info", message: "Rex-Setup-Complete" });
 */
export function informParentAboutEvt<T>(message: T) {
    (console.error as (arg: T) => void)(JSON.stringify(message) as T);
}
