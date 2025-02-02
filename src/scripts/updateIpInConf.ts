import { formatObjects, logger } from "@lib";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
try {
    
 const confPath = path.resolve(__dirname, '../../dist', 'conf', 'conf.js');
 fetch("https://api.ipify.org/").then(res=>res.text()).then(
    (ip)=>{
     const conf = readFileSync(confPath).toString().replace(/PROXY_IP\s*:\s*"([^"]*)"/, `PROXY_IP : "${ip}"`);
      writeFileSync(confPath,conf)
    }
 );
} catch (error) {
   logger.error("ERROR_WHILE_FETCHING_IP: "+formatObjects(error as object)) 
}