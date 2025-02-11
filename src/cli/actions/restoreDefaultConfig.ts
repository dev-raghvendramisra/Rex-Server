import chalk from "chalk";
import { createReadStream, createWriteStream } from "fs";

/**
 * Restores the default configuration by copying the contents of the dummy configuration file
 * to the main configuration file.
 *
 * @param {string} mainConfigPath - The path to the main configuration file.
 * @param {string} dummyConfigPath - The path to the dummy configuration file.
 *
 * @throws Will log an error message if there is an issue reading the dummy configuration file
 * or writing to the main configuration file. Specific errors include:
 * - ENOENT: File not found.
 * - EACCES: Permission denied.
 *
 * @example
 * ```typescript
 * restoreDefaultConfig('/path/to/main/config.json', '/path/to/dummy/config.json');
 * ```
 */
export default function restoreDefaultConfig(mainConfigPath: string, dummyConfigPath: string) {
    const dummyConfig = createReadStream(dummyConfigPath);
    const mainConfig = createWriteStream(mainConfigPath,{
        flags:'w'
      });;

    dummyConfig.on('error', (err: any) => {
        console.error("\n Error restoring default configuration:");
        if (err.code === 'ENOENT') {
            console.error("> Config file not found. Consider reinstalling rex-server.");
        } else if (err.code === 'EACCES') {
            console.error(`> Permission denied: ${dummyConfigPath}. Please grant necessary read permissions.`);
        } else {
            console.error(`> Error reading file: ${err.message}`);
        }
    });

    mainConfig.on('error', (err: any) => {
        console.error("\n Error restoring default configuration:");
        if (err.code === 'ENOENT') {
            console.error(`> Main config file not found: ${mainConfigPath}. Please reinstall the rex-server.\n`);
        } else if (err.code === 'EACCES') {
            console.error(`> Permission denied: ${mainConfigPath}. Please grant necessary write permissions.\n`);
        } else {
            console.error(`> Error writing file: ${err.message}\n`);
        }
    });

    mainConfig.on('finish', () => {
        console.log(chalk.greenBright("\n REX-SERVER CONFIGURATION RESET SUCCESSFULLY."));
        console.log(chalk.cyan("\n> Use 'rex start' to start the rex server.\n> Use 'rex load <config-path>' to load custom configuration again.\n"));
    });

    dummyConfig.pipe(mainConfig);
}