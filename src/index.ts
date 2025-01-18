import { REX_CONFIG } from '@types';
import cluster from 'cluster';
import  './master/index';
import {startWorkerProcess} from '@worker';
import { parseCliArgs } from '@utils';
import {startMasterProcess} from '@master'
const args = process.argv
const config = parseCliArgs(args,'--config') as REX_CONFIG

/**
 * Entry point for starting the master or worker process based on the CLI arguments.
 * 
 * This script checks if the process is running as a master or worker, then invokes the appropriate process initialization function.
 * 
 * @example
 * If run as master: startMasterProcess(config);
 * If run as worker: startWorkerProcess(config);
 */

if(cluster.isPrimary){
    startMasterProcess(config)
}
else {
    startWorkerProcess(config)
}