import path from "path";

const conf = {
    REX_CONFIG_PATH : path.resolve(__dirname,'../..','rex.config.yaml'),
    MASTER_PID_PATH : path.resolve(__dirname,'../master','master.pid'),
    LOG_FILE_PATH : path.resolve(__dirname,'../logs','server.log'),
    ENTRY_POINT_PATH : path.resolve(__dirname,'..','index.js'),
    MOCK_CONFIG_PATH : path.resolve(__dirname,'../root','mock.rex.config.yaml'),
    STATIC_DIR_PATH : path.resolve(__dirname,'../root','static'),
    REX_VERSION : "1.2.9"
} as const

export default conf