import { rex_config } from "@types";
import https from 'https'
import http from 'http'

export default function startWorkProcess(config : rex_config){
    const serverCount = config.server.listen.length 
    for(let i = 0;i<serverCount;i++){
        const PORT  = config.server.listen[i]
        if(PORT==443){
            const server = https.createServer({
              cert:config.sslConfig?.cert,
              key:config.sslConfig?.key
            },(req,res)=>{
               res.writeHead(200,{"Content-Type":"text/plain"})
               res.end("Hello from Worker process with pid: "+process.pid)
            })

            server.listen(PORT,()=>{
                // console.log(`Worker process with ${process.pid} listening on ${PORT}`)
            })
        }
        const server = http.createServer((req,res)=>{
            res.writeHead(200)
            res.end("Hello from Worker process with pid: "+process.pid+"\n")
        })
        server.listen(PORT,()=>{
            // console.log(`Worker process with ${process.pid} listening on ${PORT}`)
        })
    }
}