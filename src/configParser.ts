import fs from 'fs/promises'
import {parse} from 'yaml'
import {configSchema} from '@types'
import conf from 'conf/conf'
import { checkPortPrivilege, provideInstructions } from '@utils'
import { access } from 'fs'
import { formatObjects } from '@lib'


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
            throw new Error ("Invalid config file syntax, port must lie in (0-65535) range \n> Refer our documentation : https://github.com/dev-raghvendramisra/Rex-Server");
        }
        else {
            throw new Error(`Invalid config file syntax: \n${formatObjects(valid.error.issues[0])}\n> Refer our documentation : https://github.com/dev-raghvendramisra/Rex-Server`);
        }
    }
    else if(valid.data.server.instances.find((instance)=>{
        instance.port==443 && instance.sslConfig
    })){
        throw new Error ("Invalid config file syntax, there must be sslConfig, \n> Refer our documentation : https://github.com/dev-raghvendramisra/Rex-Server")
    }
    const config = valid.data
    
    await Promise.all(config.server.instances.map((instance,idx)=>{
        if(instance.public){
            return new Promise((res,rej)=>{
                access(instance.public as string,fs.constants.R_OK,(err)=>{
                    if(err){
                        const error = new Error(`> public_dir path for instance-${idx+1} is either invalid or lack read permissions`)
                        rej(error)
                    }
                    else res(true)
                })
            })
        }
    }))

    const lowestPort = config.server.instances.sort((instance1 ,instance2)=>{
        if(instance1.port>instance2.port) return 1
        if(instance1.port<instance2.port) return -1
        else return 0
    })[0].port
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
