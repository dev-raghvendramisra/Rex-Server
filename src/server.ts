import 'tsconfig-paths/register';
import { rex_config } from '@types';
import cluster from 'cluster';
import startMasterProcess from './master';
import configParser from './configParser';
import startWorkProcess from './worker';


export default function startServer(config : rex_config){
  if(cluster.isPrimary ){
     startMasterProcess(config)
  } 
  else {
     startWorkProcess(config)
  }
}

configParser().then((data)=>{
    startServer(data)
})