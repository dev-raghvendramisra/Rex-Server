import path from "path";
import { readFileSync, writeFileSync } from "fs";

/**
 * Updates the CLI version in the configuration file (`conf.ts`) based on the version specified in the `package.json`.
 * 
 * This function reads the `package.json` file to get the current version of the package. It then updates the `conf.ts` file
 * by replacing any existing version strings with the current version from `package.json`.
 * 
 * The `package.json` is expected to be located two levels up from the current directory, and the `conf.ts` file is expected
 * to be located in the `conf` directory adjacent to the script.
 * 
 * @throws {Error} Throws an error if reading or writing to the files fails.
 * 
 * @example
 * // Assuming the version in `package.json` is "1.2.3", the function updates the version in `conf.ts`.
 * setCliVersion();
 */
function setCliVersion() {
  // Path to the `package.json` file
  const pkgJsonPath = path.resolve(__dirname, '../../', 'package.json');
  // Read and parse `package.json` to get the current version
  const { version } = JSON.parse(readFileSync(pkgJsonPath).toString());

  // Path to the `conf.ts` file
  const confPath = path.resolve(__dirname, '../', 'conf', 'conf.ts');
  // Read the `conf.ts` file and replace the version string with the current version
  let conf = readFileSync(confPath).toString().replace(/\b\d+\.\d+\.\d+\b/g, version);
  // Write the updated content back to `conf.ts`
  writeFileSync(confPath, conf);
}

// Call the function to update the CLI version
setCliVersion();
