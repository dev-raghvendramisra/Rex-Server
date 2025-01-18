#!/usr/bin/env node

import { Command } from "commander";
import { startRexServer } from "./actions";
import stopRexServer from "./actions/stopRexServer";
import conf from "conf/conf";

const program = new Command();

/**
 * A CLI tool to manage the Rex server.
 * 
 * @module rex
 * @description Provides commands to use the Rex Server with custom or default configurations.
 */

// Setting up the CLI program
program
  .name("rex")
  .description("A CLI tool to manage the Rex server.")
  .version("1.0.0");

// Command to start the Rex server with a custom configuration file
program
  .command("use <configPath>")
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

// Parse command line arguments and execute the appropriate command
program.parse(process.argv);
