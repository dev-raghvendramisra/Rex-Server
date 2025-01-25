import { REX_CONFIG } from '@types';
import cluster from 'cluster';
import './master/index';
import { startWorkerProcess } from '@worker';
import { parseCliArgs } from '@utils';
import { startMasterProcess } from '@master';

// Parse command line arguments to extract configuration path
const args = process.argv;
const config = parseCliArgs(args, '--config') as REX_CONFIG;

/**
 * Entry point for starting the master or worker process based on the CLI arguments.
 * 
 * This script checks if the process is running as a master or worker, then invokes the appropriate
 * process initialization function.
 * 
 * - If run as master: It invokes `startMasterProcess(config)` to start the master process.
 * - If run as worker: It invokes `startWorkerProcess(config)` to start the worker process.
 * 
 * The `config` used for starting both processes is parsed from the command line arguments.
 * 
 * @example
 * If run as master: startMasterProcess(config);
 * If run as worker: startWorkerProcess(config);
 * 
 * @throws {Error} If there is an issue in parsing the CLI arguments or if the configuration is invalid.
 * 
 * @param {REX_CONFIG} config - The configuration object parsed from the CLI arguments.
 */

if (cluster.isPrimary) {
  // Start master process
  console.log("cluster is primary")
  startMasterProcess(config);
} else {
  // Start worker process
  startWorkerProcess(config);
}
