import conf from 'conf/conf';
import winston, { format, transports } from 'winston'



export const logger = winston.createLogger({
    transports:[
        new transports.File({
            filename:conf.LOG_FILE_PATH,
            level:"debug",
            format:format.combine(
                format.timestamp({
                    format:()=>new Date().toUTCString()
                }),
                format.printf((type)=>`\n[${type.timestamp}] \n${type.level}: ${type.message}`)
            )
        })
    ]

    
})


export function formatObjects(obj : Object | Array<any>){
  return JSON.stringify(obj,null,2)
}


