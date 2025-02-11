import { fileExporter } from "@utils";
import chalk from "chalk";
import conf from "conf/conf";

/**
 * Initializes and generates the Rex configuration file (`rex.config.yaml`).
 * 
 * This function copies a dummy configuration file to the desired destination, allowing users to customize it for their needs. 
 * The user is provided with instructions on how to use the generated configuration.
 * 
 * - If the configuration file generation is successful, it logs a success message with further instructions.
 * - If an error occurs (e.g., missing source file), an error message is displayed.
 * 
 * @example
 * // Generate the Rex configuration file
 * initializeRexConfig();
 * 
 * @throws {Error} If an error occurs during the generation process.
 */
export default function initializeRexConfig(): void {
  const destinationFileName = "rex.config.yaml";

  // Callback function when the file is successfully generated
  const onClose = (destinationFilePath: string) => {
    console.log(
      chalk.greenBright(
        `\n> CONFIG FILE GENERATED SUCCESSFULLY !\n\n> You can now customize it to your needs.\n> To use it, run the following command:\n> rex use ${destinationFilePath}\n`
      )
    );
  };

  // Callback function for error handling
  const onError = (err: any) => {
    if (err.code == "ENOENT") {
      return console.log(
        chalk.redBright(
          "\n> Source config file is missing\n> Consider reinstalling Rex-Server\n"
        )
      );
    } else throw new Error(err);
  };

  // Callback function when the file generation process starts
  const onOpen = () => {
    console.log(chalk.yellowBright("\n> Generating config file ..."));
  };

  // Export the configuration file
  fileExporter(conf.DUMMY_CONFIG_PATH, destinationFileName, onClose, onError, onOpen);
}
