import { formatObjects, logger } from "@lib";
import { ReadStream } from "fs";
import { IncomingMessage, ServerResponse } from "http";
import { ErrorSchema } from "@types";
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
    } else if (error.code === "EACCES" && error.port) {
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

export async function handleSSlErr(err : unknown){
     try {
      const error = await ErrorSchema.parseAsync(err)
      if (error.code === "EACCESS" && error.path) {
        logger.error(`Certificate or key lacks the necessary permissions: ${error.path}`);
        return {
          needsTermination: true,
          errMsg: `Certificate or key lacks the necessary permissions`
        };
      } else if (error.code === "ENOENT" && error.path) {
        logger.error(`Certificate or key does not exist in the specified location: ${error.path}`);
        return {
          needsTermination: true,
          errMsg: `Certificate or key does not exist in the specified location`
        };
      } else if (error.code === "ERR_OSSL_PEM_NO_START_LINE") {
        logger.error(`Invalid certificate or key format: Missing PEM start line.`);
        return {
          needsTermination: true,
          errMsg: `Invalid certificate or key format: Missing PEM start line`
        };
      } else if (error.code === "ERR_OSSL_PEM_BAD_END_LINE") {
        logger.error(`Invalid certificate or key format: Bad end line.`);
        return {
          needsTermination: true,
          errMsg: `Invalid certificate or key format: Bad end line`
        };
      } else if (error.code === "ERR_OSSL_UNSUPPORTED") {
        logger.error(`Unsupported format or encryption in certificate or key.`);
        return {
          needsTermination: true,
          errMsg: `Unsupported format or encryption in certificate or key`
        };
      } else if (error.code === "ERR_OSSL_EVP_BAD_DECRYPT") {
        logger.error(`Incorrect or missing passphrase for the encrypted private key.`);
        return {
          needsTermination: true,
          errMsg: `Incorrect or missing passphrase for the encrypted private key`
        };
      } else if (error.code === "ERR_OSSL_X509_CERT_PARSE_ERROR") {
        logger.error(`Invalid or corrupted certificate: Parsing failed.`);
        return {
          needsTermination: true,
          errMsg: `Invalid or corrupted certificate: Parsing failed`
        };
      } else if (error.code === "ERR_OSSL_RSA_ASN1_PARSE_ERROR") {
        logger.error(`Invalid or corrupted private key: Parsing failed.`);
        return {
          needsTermination: true,
          errMsg: `Invalid or corrupted private key: Parsing failed`
        };
      } else if (error.code === "ERR_OSSL_X509_KEY_VALUES_MISMATCH") {
        logger.error(`Private key does not match the certificate.`);
        return {
          needsTermination: true,
          errMsg: `Private key does not match the certificate`
        };
      }
      else return false
     } catch (error) {
       logger.error(`Unexpected error : ${formatObjects(error as Object)}`)
       return false;
     }
}