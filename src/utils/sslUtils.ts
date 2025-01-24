import { readFileSync } from "fs";
import crypto from 'crypto'



export function getSSLConfig(sslConfig : {cert:string,key:string}){
        const cert = readFileSync(sslConfig.cert)
        const key  = readFileSync(sslConfig.key)
        return{
            cert,
            key,
            secureOptions:crypto.constants.SSL_OP_NO_SSLv2 | crypto.constants.SSL_OP_NO_SSLv3
        }
}
