import path from "path";

const conf = {
    REX_CONFIG_PATH : path.resolve(__dirname,'rex.config.yaml'),
    MASTER_PID_PATH : path.resolve(__dirname,'master.pid'),
    LOG_FILE_PATH : path.resolve(__dirname,'../logs','server.log'),
    ENTRY_POINT_PATH : path.resolve(__dirname,'..','index.js'),
    MOCK_CONFIG_PATH : path.resolve(__dirname,'mock.rex.config.yaml'),
    STATIC_DIR_PATH : path.resolve(__dirname,'..','static'),
    REX_VERSION : "1.3.94"
} as const

export default conf