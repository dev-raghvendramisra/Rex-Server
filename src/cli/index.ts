import { Command } from "commander";
import configParser from '../configParser'

const program = new Command()

program
 .command("use [configPath]")
 .description("Use user's [rex.config.yaml] to start Rex Server")
 .action((configPath)=>{
    try {
      const config = configParser(configPath)
    } catch (error) {
        console.log('Error starting server : ',error)
        process.exit(1)
    }
 })
  