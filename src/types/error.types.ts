import { z } from 'zod';

/**
 * Schema for validating a Node.js error object.
 * 
 * This schema defines the structure of a Node.js error object, which can include various properties such as:
 * - `code`: A string representing the error code.
 * - `errno`: An optional number representing the error number.
 * - `syscall`: An optional string representing the system call that failed.
 * - `message`: An optional string containing the error message.
 * - `stack`: An optional string containing the stack trace.
 * - `port`: An optional number representing the port that caused the error (if applicable).
 * - `path`: An optional string representing the file path related to the error.
 * - `address`: An optional string or null representing the address associated with the error.
 * 
 * @example
 * const error = {
 *   code: "EADDRINUSE",
 *   message: "Address already in use",
 *   port: 8080
 * };
 * const parsedError = ErrorSchema.parse(error);
 */
export const ErrorSchema = z.object({
  /**
   * The error code (e.g., "EADDRINUSE").
   * 
   * @type {string}
   */
  code: z.string(),

  /**
   * The error number, if available.
   * 
   * @type {number | undefined}
   */
  errno: z.number().optional(),

  /**
   * The system call that failed, if available.
   * 
   * @type {string | undefined}
   */
  syscall: z.string().optional(),

  /**
   * The error message, if available.
   * 
   * @type {string | undefined}
   */
  message: z.string().optional(),

  /**
   * The stack trace, if available.
   * 
   * @type {string | undefined}
   */
  stack: z.string().optional(),

  /**
   * The port that caused the error, if applicable.
   * 
   * @type {number | undefined}
   */
  port: z.number().optional(),

  /**
   * The file path related to the error, if available.
   * 
   * @type {string | undefined}
   */
  path: z.string().optional(),

  /**
   * The address associated with the error, which could be a string or null.
   * 
   * @type {string | null | undefined}
   */
  address: z.union([z.string(), z.null()]).optional(),
});

/**
 * Type representing a Node.js error object as inferred from the `ErrorSchema`.
 * 
 * This type is automatically inferred from the `ErrorSchema` and represents the shape of a valid Node.js error object.
 * 
 * @example
 * const error: NodeJsErr = {
 *   code: "EADDRINUSE",
 *   message: "Address already in use",
 *   port: 8080
 * };
 */
export type NodeJsErr = z.infer<typeof ErrorSchema>;
