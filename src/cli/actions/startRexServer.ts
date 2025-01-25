import chalk from "chalk";
import { spawn } from "child_process";
import { configParser, getHostnameFromSSL } from "@utils";
import stopRexServer from "./stopRexServer";
import { readPid, writePid } from "@utils";
import conf from "conf/conf";
import { IPCINFOMessgeName, REX_CONFIG } from "@types";

/**
 * Starts the Rex server, ensuring that any previously running instance is stopped before starting a new one.
 * 
 * - If a previously running instance is detected via the PID file, it is terminated before starting a new instance.
 * - Parses the provided configuration file or uses the default configuration path.
 * - Launches the server process in a detached mode and handles its lifecycle.
 * 
 * @param {string} masterPidPath - The file path where the master process's PID is stored.
 * @param {string} [configPath] - An optional path to the server configuration file. If not provided, defaults to a predefined path.
 * 
 * @throws {Error} If an error occurs while reading the PID, parsing the configuration, or starting the server.
 * 
 * @returns {Promise<void>} Resolves once the server has been successfully started or exits the process on failure.
 * 
 * @example
 * // Start the Rex server with a custom configuration
 * startRexServer('/path/to/masterPid', '/path/to/config.yaml')
 *   .then(() => console.log('Rex server started successfully'))
 *   .catch(error => console.error('Error starting Rex server:', error));
 * 
 * @example
 * // Start the Rex server with the default configuration
 * startRexServer('/path/to/masterPid')
 *   .then(() => console.log('Rex server started successfully'))
 *   .catch(error => console.error('Error starting Rex server:', error));
 */
export default async function startRexServer(masterPidPath: string, configPath?: string): Promise<void> {
  if (!configPath) {
    configPath = conf.REX_CONFIG_PATH;
  }
  try {
    // Check for an existing master process
    const prevMasterPID = await readPid(masterPidPath);
    if (prevMasterPID) {
      console.log(
        chalk.redBright(
          "\n> REX-SERVER IS ALREADY RUNNING, SHUTTING IT DOWN TO START NEW ONE.\n"
        )
      );
      await stopRexServer({ processId: prevMasterPID }, masterPidPath);
    }

    // Parse the configuration file
    const config = await configParser(configPath) as REX_CONFIG
    const jsonConfig = JSON.stringify(config);

    // Spawn the master process
    const masterProcess = spawn("node", [conf.ENTRY_POINT_PATH, `--config=${jsonConfig}`], {
      detached: true,
      stdio: ["ignore", "ignore", "pipe"],
    });

    const masterPID = masterProcess.pid;
    await writePid(masterPidPath, `${masterPID}`);

    // Listen for errors from the master process
    masterProcess.stderr.on("data", (data) => {
      const message = JSON.parse(data.toString().trim());
      if (message.type === "info") {
        if (message.name === IPCINFOMessgeName.READY) {
          console.log(chalk.greenBright("\n> REX-SERVER STARTUP COMPLETED SUCCESSFULLY"));
          console.log(chalk.cyanBright(`> Your Rex-Server is listening on:\n`))
          let host = "localhost"
          config.server.instances.forEach((instance,idx)=>{
            if(instance.sslConfig){
              host = getHostnameFromSSL(instance.sslConfig.cert)
              console.log(chalk.cyanBright(`> https://${host}:${instance.port}`))
            }
            else console.log(chalk.cyanBright(`> http://${host}:${instance.port}`))
            config.server.instances.length==idx+1 && console.log("")
          })
          process.exit(0);
        }
      } else {
        console.log(chalk.redBright(`\n> ${message.data.message} \n`));
        process.exit(1);
      }
    });
  } catch (error: any) {
    console.log(chalk.bold(chalk.redBright(`\n> Error starting Rex-Server server:`)));
    console.log(chalk.redBright(`\n${error.message}\n`));
    process.exit(1);
  }
}
