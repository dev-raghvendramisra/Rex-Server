import { formatObjects, logger } from "@lib";
import { ReadStream } from "fs";
import { IncomingMessage, ServerResponse } from "http";
import { ErrorSchema } from "types/config.types";
import { staticResponse } from "./resUtils";
/**
* Handles errors related to port binding, such as when a port is already in use or permission is denied.
* 
* This function checks the error code and provides appropriate messages, returning information 
* about whether the process should be terminated.
* 
* @param {unknown} err - The error to handle, typically a Node.js error object.
* @returns {Promise<{errMsg: string, needTermination: boolean}>} A promise with the error message and whether termination is required.
* 
* @example
* handlePortErr(error).then((result) => {
*   if (result.needTermination) {
*     console.error(result.errMsg);
*     process.exit(1);
*   }
* });
*/
export async function handlePortErr(err:unknown) {
  try {
    const error = await ErrorSchema.parseAsync(err);
    if (error.code === "EADDRINUSE") {
      logger.error(` Port ${error.port} is already in use.`);
      return {
        errMsg:` Port ${error.port} is already in use.`,
        needTermination: true,
      };
    } else if (error.code === "EACCES") {
      logger.error(` Permission denied for port ${error.port}.`);
      return {
        errMsg:` Permission denied for port ${error.port}.`,
        needTermination: true,
      };
    } else if (error.code === "EADDRNOTAVAIL") {
      logger.error(`Address not available for port ${error.port}.`);
      return {
        errMsg:`Address not available for port ${error.port}.`,
        needTermination: true,
      };
    } else if (error.code === "EINVAL") {
      logger.error(`Port not available for binding ${error.port}.`);
      return {
        errMsg:`Port not available for binding ${error.port}.`,
        needTermination: true,
      };
    }
    else return false
  } catch (error) {
    logger.error(` Unexpected error: ${error}`);
    return false
  }
}


/**
 * Handles memory-related errors, such as when the system runs out of memory.
 * 
 * @param {unknown} err - The error to handle.
 * @returns {Promise<{needTermination: boolean}>} A promise indicating whether the process needs to be terminated.
 * 
 * @example
 * handleMemErr(error).then((result) => {
 *   if (result.needTermination) {
 *     process.exit(1);
 *   }
 * });
 */
export async function handleMemErr(err:unknown){
  try {
    const error = ErrorSchema.parse(err)
    if(error.code=="ENOMEM"){
      logger.error(`OUT_OF_MEMORY ${error.message}`)
      return {
         needTermination:true
      }
    }
  } catch (error) {
    logger.error(`UNEXPECTED_ERROR ${error}`);
  }
}


export function handleResPipingError(res : ServerResponse, fileStream : ReadStream | IncomingMessage, staticDir ?: string){
  fileStream.on('error',(err : any)=>{
    logger.error(`AN_UNEXPECTED_ERROR_OCCURED_WHILE_SENDING_THE_STATIC_FILE ${formatObjects(err)}`)
         if(res.headersSent){
           res.end("Proxy Server Error")
         }
          else {
            staticResponse(res,503)
         }
        fileStream.destroy()
  })

  res.on('error',(err)=>{
    logger.error(`CONNECTION_CLOSED_BY_THE_CLIENT ${formatObjects(err)}`)
  })
}