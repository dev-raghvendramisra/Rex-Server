import { writePid } from "@utils";
import { terminateWorkerProcess } from "@worker";
import { Cluster, Worker } from "cluster";
import { logger } from "@lib";
import conf from "conf/conf";

/**
 * Safely shuts down the master process and all associated worker processes.
 * 
 * This function ensures a clean termination by performing the following steps:
 * 1. Writes an empty string to the PID file to indicate the process is no longer active.
 * 2. Sends a `SIGTERM` signal to all worker processes managed by the cluster.
 * 3. Logs the shutdown process and exits the master process.
 * 
 * @param {Cluster} cluster - The `Cluster` instance managing the worker processes.
 * 
 * @throws {Error} If there is an issue writing to the PID file or terminating a worker process.
 * 
 * @example
 * import cluster from "cluster";
 * import { terminateMasterProcess } from "./terminateMasterProcess";
 * 
 * // Terminate the master process and all workers
 * terminateMasterProcess(cluster);
 */
export async function terminateMasterProcess(cluster: Cluster) {
  logger.warn("🧠 Master process shutting down...");

  // Clear the PID file
  await writePid(conf.MASTER_PID_PATH, "");

  // Terminate each worker process
  for (const id in cluster.workers) {
    terminateWorkerProcess(cluster.workers[id] as Worker);
  }

  // Exit the master process
  process.exit();
}
