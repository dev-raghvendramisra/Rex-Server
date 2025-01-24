#!/usr/bin/env node

import { Command } from "commander";
import { initializeRexConfig, startRexServer, streamServerLogs, testConfig } from "./actions";
import stopRexServer from "./actions/stopRexServer";
import conf from "conf/conf";
import chalk from "chalk";

const program = new Command();

/**
 * A CLI tool to manage the Rex server.
 * 
 * Provides commands to manage the Rex server, including starting, stopping, testing configurations, 
 * streaming logs, and initializing a configuration file.
 * 
 * @module rex
 * @description Rex is a flexible tool for server management, providing options for configuration setup, 
 *              server startup, log streaming, and configuration testing.
 */

// Setting up the CLI program
program
  .name("rex")
  .description("A CLI tool to manage the Rex server.")
  .version(conf.REX_VERSION) // Version pulled from configuration
  .option("-i, --init", "Initialize a new rex.config.yaml, which can be used to start the Rex Server")
  .action((options) => {
    // Initialize a new rex.config.yaml if the --init flag is provided
    if (options?.init) {
      initializeRexConfig();
    } else {
      // Display the welcome message if no specific command is provided
      console.log(chalk.greenBright("\nWelcome to Rex CLI! Use 'rex --help' to see available commands.\n"));
    }
  });

// Command to start the Rex server with a custom configuration file
program
  .command("use")
  .description(
    "Start the Rex server using a specified configuration file. " +
    "Provide the path to 'rex.config.yaml' to customize the server settings."
  )
  .argument("<configPath>", "Path to your configuration file (rex.config.yaml)")
  .action((configPath) => {
    /**
     * Starts the Rex server with a custom configuration.
     * 
     * @param {string} configPath - The path to the custom configuration file.
     * 
     * @example
     * startRexServer("/path/to/rex.config.yaml");
     */
    startRexServer(conf.MASTER_PID_PATH, configPath);
  });

// Command to start the Rex server with the default configuration
program
  .command("start")
  .description("Start the Rex server with the default configuration.")
  .action(() => {
    /**
     * Starts the Rex server with the default configuration.
     * 
     * @example
     * startRexServer(conf.MASTER_PID_PATH);
     */
    startRexServer(conf.MASTER_PID_PATH);
  });

// Command to stop the Rex server
program
  .command("stop")
  .description("Stop the running Rex server.")
  .option(
    "-p, --processId <processId>",
    "Manually specify the master process ID to stop."
  )
  .action((options) => {
    /**
     * Stops the Rex server by sending a SIGTERM signal to the process.
     * If the process ID is not provided via command-line options, it reads the ID from the master PID file.
     * 
     * @param {Object} options - The command-line options.
     * @param {string} [options.processId] - The master process ID to stop (provided via `-p` or `--processId`).
     * 
     * @example
     * stopRexServer({ processId: 12345 }, conf.MASTER_PID_PATH);
     */
    stopRexServer(options, conf.MASTER_PID_PATH);
  });

// Command to display or export server logs
program
  .command("log")
  .option("-e, --export", "It will create a log file named <server.log> in your current working directory which will contain all the logs")
  .description("Display or export the server logs.")
  .action((options) => {
    /**
     * Streams or exports the server logs based on user input.
     * 
     * If `-e` or `--export` is provided, it generates a log file in the current working directory.
     * Otherwise, it streams logs live to the console.
     * 
     * @param {Object} options - The command-line options for log streaming or export.
     * 
     * @example
     * streamServerLogs({ export: true });
     * streamServerLogs({});
     */
    streamServerLogs(options);
  });

// Command to test the configuration file before starting the server
program
  .command("test")
  .option("-p, --path <configPath>", "Path to the configuration file to test")
  .description("Test the configuration before starting the server to ensure a safe start")
  .action(testConfig);

// Parse command line arguments and execute the appropriate command
program.parse(process.argv);
