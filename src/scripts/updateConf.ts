import path from "path";
import { readFileSync, writeFileSync } from "fs";

try {
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

} catch (error) {
  console.error("ERROR_WHILE_UPDATING_CONF_WITH_VERSION_&_COMMAND",error)
}