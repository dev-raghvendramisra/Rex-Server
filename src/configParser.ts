import fs from 'fs/promises'
import path from 'path'
import {parse} from 'yaml'
import {configSchema} from '@types'

const DEFAULT_CONFIG_PATH = path.resolve(__dirname,'../rex.config.yaml')

export default async function configParser(configPath:string = DEFAULT_CONFIG_PATH){
    const yamlFile = await fs.readFile(configPath,'utf8')
    const configFile = parse(yamlFile)
    const valid = configSchema.safeParse(configFile)
    if(valid.error){
        throw ("Invalid config file syntax")
    }
    else if(valid.data.server.listen.includes(443) && !valid.data.sslConfig){
        throw ("Invalid config file syntax, there must be sslConfig")
    }
    return valid.data
}
