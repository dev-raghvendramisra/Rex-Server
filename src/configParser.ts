import fs from 'fs/promises'
import {parse} from 'yaml'
import {configSchema} from '@types'
import conf from 'conf/conf'
import { checkPortPrivilege, provideInstructions } from '@utils'


/**
 * Parses and validates a YAML configuration file for the Rex server.
 * 
 * This function reads a YAML file, validates it using the `zod` schema, and returns the parsed configuration.
 * 
 * @param {string} configPath - The path to the YAML configuration file.
 * @returns {Promise<REX_CONFIG>} A promise that resolves with the parsed and validated configuration.
 * 
 * @throws {Error} Throws an error if the configuration is invalid or missing required fields (e.g., SSL configuration for port 443).
 * 
 * @example
 * configParser('/path/to/config.yaml').then(config => {
 *   console.log('Config parsed:', config);
 * }).catch(err => {
 *   console.error('Error parsing config:', err);
 * });
 */
export default async function configParser(configPath:string = conf.REX_CONFIG_PATH){
    const yamlFile = await fs.readFile(configPath,'utf8')
    const configFile = parse(yamlFile)
    const valid = configSchema.safeParse(configFile)
    if(valid.error){
        if(valid.error.issues[0].code=='too_big'){
            throw ("Invalid config file syntax, port must lie in (0-65535) range \n> Refer our documentation : https://github.com/dev-raghvendramisra/Rex-Server");
        }
        else throw("Invalid config file syntax, "+valid.error.issues[0].message+"\n> Refer our documentation : https://github.com/dev-raghvendramisra/Rex-Server");
    }
    else if(valid.data.server.listen.includes(443) && !valid.data.sslConfig){
        throw ("Invalid config file syntax, there must be sslConfig, \n> Refer our documentation : https://github.com/dev-raghvendramisra/Rex-Server")
    }
    const config = valid.data
    const lowestPort = config.server.listen.sort()[0]
    if(lowestPort>1024){
        return config
    }
    else{   
        const nodeHasPortPrives = await checkPortPrivilege()
        if(nodeHasPortPrives){
           return config
        }
        else {
            return provideInstructions()
        }
    }
}
