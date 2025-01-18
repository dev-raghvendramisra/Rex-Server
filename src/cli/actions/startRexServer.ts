import chalk from "chalk";
import { spawn } from "child_process";
import configParser from "configParser";
import { checkPortPrivilege, provideInstructions } from "@utils";
import stopRexServer from "./stopRexServer";
import {readPid,writePid} from "@utils";
import conf from "conf/conf";
import {IPCINFOMessgeName } from "@types";

/**
 * Starts the Rex server, ensuring that any previously running instance is stopped before starting a new one.
 * If no configuration path is provided, it defaults to a predefined configuration path.
 * 
 * @param {string} masterPidPath - The file path where the master process's PID is stored.
 * @param {string} [configPath] - An optional path to the server configuration file. If not provided, defaults to a predefined path.
 * 
 * @throws {Error} If any error occurs while reading the PID, parsing the configuration, or starting the server.
 * 
 * @returns {Promise<void>} A promise that resolves once the server has been successfully started, or rejects if an error occurs.
 * 
 * @example
 * import startRexServer from './startRexServer';
 * 
 * startRexServer('/path/to/masterPid', '/path/to/config.json')
 *   .then(() => console.log('Rex server started successfully'))
 *   .catch(error => console.error('Error starting Rex server:', error));
 */
export default async function startRexServer(masterPidPath : string, configPath ?: string) {
    if (!configPath) {
        configPath = conf.REX_CONFIG_PATH;
    }
    
    try {
        const prevMasterPID = await readPid(masterPidPath);
        if (prevMasterPID) {
            console.log(chalk.redBright("\n>REX-SERVER IS ALREADY RUNNING, SHUTTING IT DOWN TO START NEW ONE.\n"));
            await stopRexServer({ processId: prevMasterPID }, masterPidPath);
        }
        
        const hasPrives = await checkPortPrivilege();
        if (!hasPrives) {
            return provideInstructions();
        }
        
        const config = await configParser(configPath);
        const jsonConfig = JSON.stringify(config);
        
        const masterProcess = spawn('node', ['dist/index.js', `--config=${jsonConfig}`], {
            detached: true,
            stdio: ["ignore", "ignore", "pipe"]
        });
        
        const masterPID = masterProcess.pid;
        await writePid(masterPidPath, `${masterPID}`);
        
        masterProcess.stderr.on('data', (data) => {
            const message = JSON.parse(data.toString().trim());
            if (message.type === "info") {
                if (message.name === IPCINFOMessgeName.READY) {
                    console.log(chalk.greenBright("\n> REX-SERVER STARTUP COMPLETED SUCCESSFULLY\n"));
                    process.exit(0);
                }
            } else {
                console.log(chalk.redBright(`\n> ${message.data.message} \n`));
                process.exit(1);
            }
        });
    } catch (error) {
        console.log(chalk.redBright(`\n> Error starting Rex-Server server : ${error}\n`));
        process.exit(1);
    }
}
