#!/usr/bin/env node

import { Command } from "commander";
import {startRexServer} from "./actions";
import path from "path";
import stopRexServer from "./actions/stopRexServer";
const MASTER_PID_PATH = path.resolve(__dirname,'..','master.pid')
const program = new Command()

program
  .name("rex")
  .description("A CLI tool to manage the Rex server.")
  .version("1.0.0"); 


program
  .command("use <configPath>")
  .description(
    "Start the Rex server using a specified configuration file. " +
    "Provide the path to 'rex.config.yaml' to customize the server settings."
  )
  .argument("<configPath>", "Path to your configuration file (rex.config.yaml)")
  .action((configPath) => {
    startRexServer(MASTER_PID_PATH, configPath);
  });


program
  .command("start")
  .description("Start the Rex server with the default configuration.")
  .action(() => {
    startRexServer(MASTER_PID_PATH);
  });

program
  .command("stop")
  .description("Stop the running Rex server.")
  .option(
    "-p, --processId <processId>",
    "Manually specify the master process ID to stop."
  )
  .action((options) => {
    stopRexServer(options, MASTER_PID_PATH);
  });


 program.parse(process.argv)
  