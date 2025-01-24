import { IPCERRMessage, IPCINFOMessage, IPCINFOMessgeName, REX_CONFIG } from "@types";
import cluster from "cluster";
import { cpus } from "os";
import { terminateMasterProcess } from "./terminateMasterProcess";
import { handleMemErr, handlePortErr, handleSSlErr, informParentAboutEvt, rexServerReady } from "@utils";
import { logger } from "@lib";

/**
 * Initializes and starts the master process of the Rex server.
 * 
 * The master process is responsible for:
 * - Forking worker processes based on the configuration.
 * - Handling inter-process communication (IPC) messages from worker processes.
 * - Managing worker lifecycle, including restarting them in case of unexpected exits.
 * - Gracefully shutting down all processes in response to critical errors or termination signals.
 * 
 * @param {REX_CONFIG} config - The server configuration object containing:
 *   - `workers`: Number of worker processes to fork (`"auto"` for CPU count-based determination).
 *   - `server`: Server-specific details like instances, routes, and upstreams.
 * 
 * @throws {Error} Will terminate the master process if workers fail to start due to critical errors (e.g., port conflicts, SSL issues, or memory errors).
 * 
 * @example
 * startMasterProcess({
 *   workers: "auto",
 *   server: { instances: [{ port: 80 }] },
 *   upstream: ["http://localhost:8000"],
 * });
 */
export function startMasterProcess(config: REX_CONFIG) {
  const workerCount = config.workers === "auto" ? cpus().length : config.workers;
  let shutdown = false; // Tracks if the system is in shutdown mode
  let readyWorkers = 0; // Tracks the number of workers ready to handle requests

  // Fork worker processes based on the configuration
  for (let i = 0; i < workerCount; i++) {
    cluster.fork();
  }

  // Log when a worker becomes online
  cluster.on("online", (worker) => {
    logger.info(`🛠️  Worker process ${worker.id} started`);
  });

  // Handle IPC messages from workers
  cluster.on("message", async (worker, message: IPCERRMessage | IPCINFOMessage) => {
    if (message.type === "error") {
      const error = message.data;

      // Handle port-related errors
      const portError = await handlePortErr(error);
      if (portError && portError.needTermination) {
        shutdown = true;
        informParentAboutEvt<IPCERRMessage>({
          type: "error",
          data: {
            code: error.code,
            message: `REX-STARTUP-FAILED\n>${portError.errMsg}`,
          },
        });
        return terminateMasterProcess(cluster);
      }

      // Handle memory-related errors
      const memError = await handleMemErr(error);
      if (memError && memError.needTermination) {
        shutdown = true;
        return terminateMasterProcess(cluster);
      }

      // Handle SSL-related errors
      const sslError = await handleSSlErr(error);
      if (sslError && sslError.needTermination) {
        shutdown = true;
        informParentAboutEvt<IPCERRMessage>({
          type: "error",
          data: {
            code: error.code,
            message: `REX-STARTUP-FAILED\n>${sslError.errMsg}`,
          },
        });
        return terminateMasterProcess(cluster);
      }

      // Terminate the worker process for non-critical errors
      worker.kill("SIGTERM");
    } else {
      // Handle successful worker initialization and readiness
      if (message.name === IPCINFOMessgeName.RESTART) {
        worker.kill("SIGTERM");
      } else if (message.name === IPCINFOMessgeName.READY) {
        readyWorkers++;
        if (readyWorkers === workerCount) {
          rexServerReady(); // Signal that all workers are ready
        }
      }
    }
  });

  // Handle worker exits and restart them if necessary
  cluster.on("exit", (worker) => {
    if (!shutdown) {
      logger.error(`🛠️  WORKER_PROCESS_(${worker.id})_DIED.`);
      cluster.fork();
    }
  });

  logger.info("🧠 Master process started");

  // Handle termination signals to gracefully shut down
  process.on("SIGTERM", () => {
    shutdown = true;
    terminateMasterProcess(cluster);
  });
}
