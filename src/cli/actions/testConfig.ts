import { configParser } from "@utils";
import chalk from "chalk";

export default async function testConfig(options : any){
    try {
        await configParser(options?.path)
        console.log(chalk.greenBright(`\n> CONFIG FILE PASSED ALL THE TESTS !\n`))
    } catch (error : any) {
        console.log(chalk.redBright(`\n> CONFIG FILE FAILED THE TEST !`))
        console.log(chalk.redBright(`\n${error.message}\n`))
    }
} 