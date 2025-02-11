import chalk from "chalk";
import { createReadStream, createWriteStream } from "fs";
import path from "path";

/**
 * Loads a custom Rex configuration by reading from a user-specified configuration file
 * and writing to the main configuration file.
 *
 * @param {string} userConfigPath - The path to the user configuration file.
 * @param {string} mainConfigPath - The path to the main configuration file.
 *
 * @throws Will log an error message if there is an issue reading the user configuration file.
 * @throws Will log an error message if there is an issue writing to the main configuration file.
 *
 * @example
 * loadCustomRexConfig('/path/to/user/config.json', '/path/to/main/config.json');
 */
export default function loadCustomRexConfig(userConfigPath: string, mainConfigPath: string) {
  const userConfig = createReadStream(userConfigPath);
  const mainConfig = createWriteStream(mainConfigPath,{
    flags:'w'
  });

  userConfig.on('error', (err : any) => {
    console.error(`\n> Error loading custom configuration: ${userConfigPath}`);
    if (err.code === 'ENOENT') {
      console.error("\n> Error loading config file:")
    } else if (err.code === 'EACCES') {
      console.error(`> Permission denied: ${userConfigPath}\n`);
    } else {
      console.error(`> Error reading file: ${err.message}\n`);
    }
  });

  mainConfig.on('error', (err:any) => {
    console.error(`\n> Error loading custom configuration: ${userConfigPath}`);
    if (err.code === 'ENOENT') {
      console.error(`> File not found: ${mainConfigPath}\n`);
    } else if (err.code === 'EACCES') {
      console.error(`> Permission denied: ${mainConfigPath}\n`);
    } else {
      console.error(`> Error writing file: ${err.message}\n`);
    }
  });

  mainConfig.on('finish',()=>{
    console.log(chalk.greenBright("\nCONFIGURATION LOADED IN REX-SERVER SUCCESSFULLY"))
    console.log(chalk.cyan("\n> Use 'rex start' to start the rex server\n> Use 'rex reset' to reset to default configuration.\n"))
  })
  userConfig.pipe(mainConfig);
}