import conf from 'conf/conf';
import winston, { format, transports } from 'winston'



const logger = winston.createLogger({
    transports:[
        new transports.File({
            filename:conf.LOG_FILE_PATH,
            level:"debug",
            format:format.combine(
                format.timestamp({
                    format:()=>new Date().toUTCString()
                }),
                format.colorize(),
                format.printf(type=>`\n[${type.timestamp}] \n${type.level}: ${type.message}`)
            )
        })
    ]

    
})

export default logger