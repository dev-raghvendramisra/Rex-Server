import { NodeJsErr } from "./error.types";

/**
 * Interface representing an error message sent via IPC (Inter-Process Communication).
 * 
 * This interface is used to represent error messages exchanged between processes in the system. 
 * It contains the error type and the actual error data, which is defined by the `NodeJsErr` type.
 * 
 * @interface IPCERRMessage
 */
export interface IPCERRMessage {
  /**
   * The type of the message, which is always "error".
   * 
   * @type {string}
   * @default "error"
   */
  type: "error";

  /**
   * The error data, which conforms to the `NodeJsErr` type.
   * 
   * @type {NodeJsErr}
   */
  data: NodeJsErr;
}

/**
 * Enum representing possible information message types exchanged via IPC.
 * 
 * This enum defines two types of informational messages that can be sent between processes:
 * - `RESTART`: Indicates a process restart request.
 * - `READY`: Indicates that a process is ready.
 * 
 * @enum {string}
 */
export enum IPCINFOMessgeName {
  RESTART = "RESTART",
  READY = "READY",
}

/**
 * Interface representing an information message sent via IPC (Inter-Process Communication).
 * 
 * This interface is used to represent informational messages exchanged between processes in the system. 
 * It includes the message type, a specific name (defined by `IPCINFOMessgeName`), and a textual message.
 * 
 * @interface IPCINFOMessage
 */
export interface IPCINFOMessage {
  /**
   * The type of the message, which is always "info".
   * 
   * @type {string}
   * @default "info"
   */
  type: "info";

  /**
   * The name of the informational message, which corresponds to an entry in the `IPCINFOMessgeName` enum.
   * 
   * @type {IPCINFOMessgeName}
   */
  name: IPCINFOMessgeName;

  /**
   * The content of the informational message.
   * 
   * @type {string}
   */
  message: string;
}
