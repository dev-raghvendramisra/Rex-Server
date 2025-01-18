import { writePid } from "@utils";
import { terminateWorkerProcess } from "@worker";
import { Cluster, Worker } from "cluster";
import { logger } from "@lib";
import conf from "conf/conf";

/**
 * Terminates the master process and all of its associated worker processes.
 * 
 * This function writes an empty string to the PID file and then sends a termination signal 
 * (`SIGTERM`) to all worker processes before exiting the master process.
 * 
 * @param {Cluster} cluster - The cluster instance that manages the worker processes.
 * 
 * @example
 * terminateMasterProcess(cluster);
 */

export async function terminateMasterProcess(cluster:Cluster){ 
    logger.warn("🧠 Master process shutting down...")
    await writePid(conf.MASTER_PID_PATH,"")
    for (const id in cluster.workers ){
        terminateWorkerProcess(cluster.workers[id] as Worker)
    }
    process.exit()
}