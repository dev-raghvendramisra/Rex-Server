import path from "path";

const conf = {
    REX_CONFIG_PATH : path.resolve(__dirname,'rex.config.yaml'),
    MASTER_PID_PATH : path.resolve(__dirname,'master.pid'),
    LOG_FILE_PATH : path.resolve(__dirname,'../logs','server.log'),
    SPAWN_COMMAND : {
        cmd:'ts-node',
        args:["-r","tsconfig-paths/register",path.resolve(__dirname,'..','index.ts')]
    },
    MOCK_CONFIG_PATH : path.resolve(__dirname,'mock.rex.config.yaml'),
    STATIC_DIR_PATH : path.resolve(__dirname,'..','static'),
    PROXY_IP : "127.0.0.1",
    REX_VERSION : "1.3.96"
} as const

export default conf

