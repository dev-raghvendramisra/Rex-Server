import path from "path";

const conf = {
    REX_CONFIG_PATH : path.resolve(__dirname,'../..','rex.config.yaml'),
    MASTER_PID_PATH : path.resolve(__dirname,'../master','master.pid'),
    LOG_FILE_PATH : path.resolve(__dirname,'../logs/output.log')
} as const

export default conf