import fs from 'fs/promises';
import { parse } from 'yaml';
import { configSchema } from '@types';
import conf from 'conf/conf';
import { access, createReadStream, createWriteStream, readFileSync } from 'fs';
import { formatObjects } from '@lib';
import { exec } from 'child_process';
import os from 'os';
import { REX_CONFIG } from "@types";
import chalk from 'chalk';

/**
 * Parses the command-line arguments to extract the configuration.
 * 
 * This function searches the command-line arguments for a specified key (e.g., `--config`) and returns the parsed configuration
 * if found. If no matching key is found, it returns `false`.
 * 
 * @param {string[]} args - The command-line arguments.
 * @param {string} argKey - The key to search for in the arguments (e.g., `--config`).
 * 
 * @returns {REX_CONFIG | false} - The parsed configuration if found, or `false` otherwise.
 * 
 * @example
 * const config = parseCliArgs(process.argv, '--config');
 * if (config) {
 *   console.log(config);
 * }
 */
export function parseCliArgs(args: string[], argKey: string): REX_CONFIG | false {
  const configArg = args.find((arg) => {
    return arg.startsWith(argKey);
  });

  if (!configArg) {
    return false;
  }
  const config = configArg.split("=")[1];
  if (config) {
    return JSON.parse(config);
  }
  return false;
}

/**
 * Checks if the current process has the necessary privileges to bind to privileged ports.
 * 
 * On Linux systems, binding to ports below 1024 requires elevated privileges. This function checks if the process has the
 * required privileges to bind to such ports.
 * 
 * @returns {Promise<boolean>} A promise that resolves to `true` if the process has the necessary privileges, or `false` otherwise.
 * 
 * @example
 * checkPortPrivilege().then((hasPriv) => {
 *   if (hasPriv) {
 *     console.log("Process has port binding privileges.");
 *   } else {
 *     console.log("Process does not have port binding privileges.");
 *   }
 * });
 */
export function checkPortPrivilege(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (os.platform() === 'linux') {
      exec('getcap $(which node)', (err, stdout, stderr) => {
        if (err) {
          reject(stderr);
        }
        if (stdout.includes('cap_net_bind_service')) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    } else {
      resolve(false);
    }
  });
}

/**
 * Provides instructions on how to obtain the required port binding privileges based on the OS platform.
 * 
 * This function checks the platform of the system and provides instructions on how to obtain the necessary permissions
 * to bind to privileged ports.
 * 
 * @example
 * provideInstructions();
 */
export function provideInstructions() {
  const platform = os.platform();

  if (platform === 'linux') {
    throw new Error(`> Missing capability: cap_net_bind_service\n> To bind to privileged ports, run the following command:\n> sudo setcap cap_net_bind_service=+ep $(which node)`);
  } else if (platform === 'darwin') {
    throw new Error(`> On macOS, you need to use sudo to bind to ports below 1024.\n> Try running Rex-Server with sudo, or use a port above 1024.`);
  } else if (platform === 'win32') {
    throw new Error(`> On Windows, you may need to run your terminal as Administrator.\n> Run the command prompt or terminal as Administrator to bind to privileged ports.`);
  } else {
    throw new Error(`> Unsupported platform. Please refer to your OS documentation for more information.`);
  }
}

/**
 * Parses and validates a YAML configuration file for the Rex server.
 * 
 * This function reads a YAML configuration file, validates it using the `zod` schema, and returns the parsed configuration.
 * If the configuration is invalid or missing required fields (e.g., SSL configuration for port 443), an error is thrown.
 * 
 * @param {string} configPath - The path to the YAML configuration file.
 * @returns {Promise<REX_CONFIG>} A promise that resolves with the parsed and validated configuration.
 * 
 * @throws {Error} Throws an error if the configuration is invalid or missing required fields.
 * 
 * @example
 * configParser('/path/to/config.yaml').then(config => {
 *   console.log('Config parsed:', config);
 * }).catch(err => {
 *   console.error('Error parsing config:', err);
 * });
 */
export async function configParser(configPath: string = conf.REX_CONFIG_PATH) {
  const yamlFile = await fs.readFile(configPath, 'utf8');
  const configFile = parse(yamlFile);
  const valid = configSchema.safeParse(configFile);
  if (valid.error) {
    if (valid.error.issues[0].code === 'too_big') {
      throw new Error("Invalid config file syntax, port must lie in (0-65535) range\n> Refer our documentation: https://github.com/dev-raghvendramisra/Rex-Server");
    } else {
      throw new Error(`Invalid config file syntax: \n${formatObjects(valid.error.issues[0])}\n> Refer our documentation: https://github.com/dev-raghvendramisra/Rex-Server`);
    }
  }
  const config = valid.data;

  if (config.server.instances.find((instance) => instance.port === 443)) {
    const instance = config.server.instances.find((instance) => instance.port === 443);
    if (!instance?.sslConfig) {
      throw new Error("Invalid config file syntax, there must be sslConfig for server listening on port 443, \n> Refer our documentation: https://github.com/dev-raghvendramisra/Rex-Server");
    }

    await Promise.all([
      checkFilesAccessibilty(instance.sslConfig.cert, `Certificate file either lacks necessary permission or doesn't exist at path: "${instance.sslConfig.cert}"`),
      checkFilesAccessibilty(instance.sslConfig.key, `Certificate key file either lacks necessary permission or doesn't exist at path: "${instance.sslConfig.key}"`)
    ]);
  }

  await Promise.all(config.server.instances.map((instance, idx) => {
    if (instance.public) {
      return checkFilesAccessibilty(instance.public, `public_dir path for instance-${idx + 1} is either invalid or lacks read permissions`);
    }
  }));

  const lowestPort = config.server.instances.sort((instance1, instance2) => {
    if (instance1.port > instance2.port) return 1;
    if (instance1.port < instance2.port) return -1;
    else return 0;
  })[0].port;

  if (lowestPort > 1024) {
    return config;
  } else {
    const nodeHasPortPrives = await checkPortPrivilege();
    if (nodeHasPortPrives) {
      return config;
    } else {
      return provideInstructions();
    }
  }
}

/**
 * Checks if the file has the necessary read permissions.
 * 
 * This function checks if the specified file path has read permissions. If not, it throws an error with the provided message.
 * 
 * @param {string} path - The file path to check.
 * @param {string} errMsg - The error message to throw if the file lacks read permissions.
 * 
 * @returns {Promise<boolean>} A promise that resolves if the file has read permissions, or rejects with an error message.
 * 
 * @example
 * checkFilesAccessibilty('/path/to/file', 'File lacks necessary read permissions')
 *   .then(() => console.log('File is accessible'))
 *   .catch((err) => console.error(err));
 */
export function checkFilesAccessibilty(path: string, errMsg: string) {
  return new Promise((res, rej) => {
    access(path, fs.constants.R_OK, (err) => {
      if (err) {
        const error = new Error(`> ${errMsg || path + " lacks necessary read permissions"}`);
        rej(error);
      } else res(true);
    });
  });
}

/**
 * Exports a file from a source to a destination.
 * 
 * This function copies a file from the source path to the destination file, and provides callback hooks for when the operation
 * is ready, successful, or encounters an error.
 * 
 * @param {string} sourceFilePath - The path to the source file.
 * @param {string} destinationFileName - The name of the destination file.
 * @param {Function} [onClose] - A callback function to be invoked when the file has been successfully written.
 * @param {Function} [onError] - A callback function to be invoked if an error occurs during the file operation.
 * @param {Function} [onOpen] - A callback function to be invoked when the file operation is ready to begin.
 * 
 * @example
 * fileExporter('/path/to/source/file', 'destination-file.txt')
 *   .then(() => console.log('File exported successfully'))
 *   .catch((err) => console.error('Error exporting file:', err));
 */
export function fileExporter(
  sourceFilePath: string,
  destinationFileName: string,
  onClose?: (destinationFilePath: string) => void,
  onError?: (err: any) => void,
  onOpen?: () => void
) {
  try {
    const cwd = process.cwd();
    const destinationFile = createWriteStream(cwd + `/${destinationFileName}`);
    const sourceFile = createReadStream(sourceFilePath);
    sourceFile.pipe(destinationFile);
    destinationFile.on('close', () => {
      if (onClose) {
        return onClose(destinationFile.path as string);
      }
      console.log(chalk.greenBright(`\n> FILE GENERATED SUCCESSFULLY !\n`));
    });
    destinationFile.on('open', () => {
      if (onOpen) {
        return onOpen();
      }
      console.log(chalk.yellowBright("\n> Generating file ..."));
    });
    sourceFile.on('error', (err: any) => {
      if (onError) {
        return onError(err);
      }
      if (err.code === "ENOENT") {
        return console.log(chalk.redBright("\n> Source file is missing\n> Consider reinstalling Rex-Server\n"));
      } else throw new Error(err);
    });
  } catch (error: any) {
    return console.log(chalk.redBright("> Unexpected error occurred while generating the file\n> Please report this issue here https://github.com/dev-raghvendramisra/Rex-Server/issues"));
  }
}
