import { NodeJsErr } from "./error.types"

export interface IPCERRMessage{
    type:"error"
    data:NodeJsErr
}

export enum IPCINFOMessgeName {
    RESTART = "RESTART",
    READY = "READY",
    
}
export interface IPCINFOMessage{
    type:"info"
    name:IPCINFOMessgeName,
    message:string
}