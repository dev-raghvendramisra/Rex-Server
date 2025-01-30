import path from "path";
import { readFileSync, writeFileSync } from "fs";

/**
 * Updates the `conf.js` file with the current version from `package.json` and replaces the TypeScript
 * executable command (`ts-node`) with the JavaScript executable command (`node`).
 * 
 * This function performs the following steps:
 * 1. Reads and parses the `package.json` file to get the current version of the package.
 * 2. Reads the `conf.ts` (JavaScript configuration file) and:
 *    - Replaces all occurrences of the version number in the configuration with the current version from `package.json`.
 *    - Replaces the TypeScript executable command (`ts-node`) with the JavaScript executable command (`node`).
 * 3. Writes the updated content back to the `conf.js` file.
 * 
 * The `package.json` is expected to be located two levels up from the current directory, and the `conf.ts` file
 * is expected to be located in the `dist/conf` directory.
 * 
 * @throws {Error} Throws an error if reading or writing to the files fails.
 * 
 * @example
 * // Assuming the version in `package.json` is "1.2.3", the function updates the version in `conf.ts`
 * updateConf();
 */
function updateConf() {
  // Path to the `package.json` file
  const pkgJsonPath = path.resolve(__dirname, '../../', 'package.json');
  // Read and parse `package.json` to get the current version
  const { version } = JSON.parse(readFileSync(pkgJsonPath).toString());

  // Path to the `conf.ts` file (after compilation, it should be a `conf.js` file)
  const confPath = path.resolve(__dirname, '../../dist', 'conf', 'conf.js');
  
  // Replace the version and executable command in `conf.js` file
  const jsCommand = `SPAWN_COMMAND : {
    cmd: "node",
    args: [path_1.default.resolve(__dirname,'..','index.js')]
  }`;

  let conf = readFileSync(confPath).toString()
    .replace(/\b\d+\.\d+\.\d+\b/g, version) // Replaces the version number
    .replace(/SPAWN_COMMAND\s*:\s*\{\s*cmd\s*:\s*'ts-node',\s*args\s*:\s*\[\s*"-r",\s*".*?",\s*(path_1\.default\.resolve\([^)]*\)|path\.resolve\([^)]*\))\s*\]\s*\}/, jsCommand); // Replaces the TypeScript command with the JavaScript command
  
  // Write the updated content back to `conf.js`
  writeFileSync(confPath, conf);
}

// Call the function to update the CLI version
updateConf();
