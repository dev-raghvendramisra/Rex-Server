import path from "path";
import { readFileSync,writeFileSync } from "fs";

function setCliVersion() {
    const pkgJsonPath = path.resolve(__dirname, '../../', 'package.json');
    const { version } = JSON.parse(readFileSync(pkgJsonPath).toString());

    const confPath = path.resolve(__dirname, '../', 'conf', 'conf.ts');
    let conf = readFileSync(confPath).toString().replace(/\b\d+\.\d+\.\d+\b/g, version);
    writeFileSync(confPath, conf);
}

setCliVersion()