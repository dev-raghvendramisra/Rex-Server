import { rex_config } from '@types';
import cluster from 'cluster';
import startMasterProcess from './master';
import startWorkProcess from './worker';
import { parseCliArgs } from '@utils';

const args = process.argv
const config = parseCliArgs(args,'--config') as rex_config

if(cluster.isPrimary){
    startMasterProcess(config)
}
else {
    startWorkProcess(config)
}