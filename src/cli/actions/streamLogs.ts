import { fileExporter } from "@utils";
import chalk from "chalk";
import { spawn } from "child_process";
import conf from "conf/conf";

/**
 * Streams or exports server logs for the Rex server.It uses `fileExporter` utility to export the logs if the `-e` or `--export` flag is passed in command.
 * 
 * - If the `export` option is not provided, the function streams live logs to the console using the `tail` command.
 * - If the `export` option is provided, it generates a log file in the current working directory.
 * 
 * @param {Object} options - Options for streaming or exporting logs.
 * @param {boolean} [options.export] - Whether to export the logs to a file (`true`) or stream them live (`false`).
 * 
 * @example
 * // Stream live logs
 * streamServerLogs({});
 * 
 * @example
 * // Export logs to a file
 * streamServerLogs({ export: true });
 */
export default async function streamServerLogs(options: { export?: boolean }) {
  try {
    if (!options.export) {
      // Stream live server logs
      console.log(
        chalk.yellowBright(`\n> Live streaming server logs, press 'ctrl/cmd + c to stop':\n`)
      );
      const logs = spawn("tail", ["-f", conf.LOG_FILE_PATH], {
        stdio: ["ignore", "inherit", "inherit"],
      });

      // Handle errors during log streaming
      logs.on("error", (err) => {
        console.log(chalk.redBright(`> An error occurred while streaming logs: ${err}`));
      });
    } else {
      // Export logs to a file
      const onClose = (destinationFilePath: string) => {
        console.log(
          chalk.greenBright(
            `\n> LOG FILE GENERATED SUCCESSFULLY !\n> You can now check it at: ${destinationFilePath}\n`
          )
        );
      };

      const onError = (err: any) => {
        if (err.code === "ENOENT") {
          return console.log(
            chalk.redBright(
              "\n> Source log file is missing\n> Consider reinstalling Rex-Server\n"
            )
          );
        }
        throw new Error(err);
      };

      const onOpen = () => {
        console.log(chalk.yellowBright("\n> Generating log file ..."));
      };

      const destinationFileName = "server.log";
      fileExporter(conf.LOG_FILE_PATH, destinationFileName, onClose, onError, onOpen);
    }
  } catch (error) {
    console.log(
      chalk.redBright(
        `> \nAN_ERROR_OCCURED_WHILE_STREAMING_LOGS\n> Kindly report this issue here: https://github.com/dev-raghvendramisra/Rex-Server/issues`
      )
    );
  }
}
