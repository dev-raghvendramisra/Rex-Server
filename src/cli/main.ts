#!/usr/bin/env node

import { Command } from "commander";
import {
  initializeRexConfig,
  loadCustomRexConfig,
  restoreDefaultConfig,
  startRexServer,
  streamServerLogs,
  testConfig,
} from "./actions";
import stopRexServer from "./actions/stopRexServer";
import conf from "conf/conf";
import chalk from "chalk";
import { exec } from "child_process";
import path from "path";

const program = new Command();

/**
 * Rex CLI - A command-line interface for managing the Rex server.
 *
 * This CLI provides functionalities for configuring, starting, stopping,
 * and testing the Rex server. Users can also manage server logs and reset
 * configurations as needed.
 *
 * @module rex
 */

// Setting up the CLI program
program
  .name("rex")
  .description("A command-line tool to manage the Rex server.")
  .version(`v${conf.REX_VERSION}`, "-v ,--version") // Fetches version from config
  .option(
    "-i, --init",
    "Initialize a new 'rex.config.yaml' in the current directory."
  )
  .action((options) => {
    if (options?.init) {
      initializeRexConfig();
    } else {
      console.log(
        chalk.greenBright(
          "\nWelcome to Rex CLI! Use 'rex --help' to see available commands.\n"
        )
      );
    }
  });

/**
 * Load a custom configuration file for Rex.
 *
 * This command allows users to load a custom 'rex.config.yaml' file
 * from an absolute path. The configuration file will be used when
 * launching the Rex server.
 *
 * Usage: `rex load <configPath>`
 *
 * @param {string} configPath - Absolute path to the configuration file.
 */
program
  .command("load")
  .description(
    "Load a custom Rex configuration file.\n" +
      "Provide the absolute path to 'rex.config.yaml'. After loading, use 'rex start' to launch the server."
  )
  .argument("<configPath>", "Absolute path to the configuration file.")
  .action(async (configPath) => {
    loadCustomRexConfig(configPath, conf.REX_CONFIG_PATH);
  });

/**
 * Start the Rex server.
 *
 * This command starts the Rex server using the loaded configuration.
 * Before launching, it updates the IP address in the configuration.
 *
 * Usage: `rex start`
 */
program
  .command("start")
  .description("Start the Rex server using the configured settings.")
  .action(() => {
    const ip = exec(
      `node ${path.resolve(__dirname, "../scripts", "updateIpInConf.js")}`
    );
    ip.on("close", () => startRexServer(conf.MASTER_PID_PATH));
  });

/**
 * Stop the Rex server.
 *
 * Stops the running Rex server process. Users can specify a process ID manually.
 *
 * Usage: `rex stop [-p <processId>]`
 *
 * @param {string} [processId] - (Optional) Manually specify the process ID to terminate.
 */
program
  .command("stop")
  .description("Stop the running Rex server.")
  .option("-p, --processId <processId>", "Manually specify the process ID to stop.")
  .action((options) => {
    stopRexServer(options, conf.MASTER_PID_PATH);
  });

/**
 * Manage server logs.
 *
 * Users can stream live server logs or export them to a file.
 *
 * Usage:
 * - `rex log` (Display live logs)
 * - `rex log -e` (Export logs to 'server.log')
 */
program
  .command("log")
  .description(
    "Display live server logs or export them to a file.\n" +
      "Use '-e' to export logs to 'server.log' in the current directory."
  )
  .option("-e, --export", "Export logs to 'server.log'.")
  .action((options) => {
    streamServerLogs(options);
  });

/**
 * Test the configuration before starting the server.
 *
 * This command validates a given configuration file.
 *
 * Usage:
 * - `rex test` (Tests the default loaded config)
 * - `rex test -p <absolutePath>` (Tests a specified config file)
 *
 * @param {string} [configPath] - (Optional) Absolute path to a configuration file.
 */
program
  .command("test")
  .description(
    "Validate the Rex server configuration file.\n" +
      "Use '-p <absolutePath>' to specify a configuration file."
  )
  .option("-p, --path <configPath>", "Absolute path to the configuration file.")
  .action(testConfig);

/**
 * Reset the Rex server to default configuration.
 *
 * Restores the server settings to default by replacing the current configuration
 * with a dummy default configuration.
 *
 * Usage: `rex reset`
 */
program
  .command("reset")
  .description("Reset the Rex server to use the default configuration.")
  .action(() => restoreDefaultConfig(conf.REX_CONFIG_PATH, conf.DUMMY_CONFIG_PATH));

// Parse command-line arguments
program.parse(process.argv);
