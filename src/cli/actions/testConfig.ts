import { configParser } from "@utils";
import chalk from "chalk";

/**
 * Tests the validity of a configuration file for the Rex server.
 * 
 * This action function uses the `configParser` utility to validate the structure and content of the configuration file.
 * If the configuration is valid, a success message is displayed. Otherwise, an error message is shown with details
 * about the failure.
 * 
 * @param {Object} options - The options for testing the configuration.
 * @param {string} [options.path] - The path to the configuration file to be tested.
 * 
 * @example
 * // Test a configuration file located at "./rex.config.yaml"
 * testConfig({ path: "./rex.config.yaml" });
 * 
 * @example
 * // Test the default configuration file if no path is provided
 * testConfig({});
 */
export default async function testConfig(options: { path?: string }) {
  try {
    // Parse and validate the configuration file
    await configParser(options?.path);
    console.log(chalk.greenBright(`\n> CONFIG FILE PASSED ALL THE TESTS !\n`));
  } catch (error: any) {
    // Log errors if the configuration file is invalid
    console.log(chalk.redBright(`\n> CONFIG FILE FAILED THE TEST !`));
    console.log(chalk.redBright(`\n${error.message}\n`));
  }
}
