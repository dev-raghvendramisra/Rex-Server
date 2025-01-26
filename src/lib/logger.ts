import conf from "conf/conf";
import winston, { format, transports } from "winston";

/**
 * The logger instance for the Rex server.
 * 
 * This logger is configured using the `winston` library and writes log messages to a file specified
 * in the configuration. It includes timestamps and formats log messages for better readability.
 * 
 * - Log Level: `debug`
 * - Log File: Defined by `conf.LOG_FILE_PATH`
 * - Format: 
 *   - Timestamp: UTC format
 *   - Message: Includes timestamp, log level, and the log message
 * 
 * @example
 * logger.info("This is an info message");
 * logger.error("This is an error message");
 */
export const logger = winston.createLogger({
  transports: [
    new transports.File({
      filename: conf.LOG_FILE_PATH,
      level: "debug",
      format: format.combine(
        format.timestamp({format:'YYYY-MM-DD HH:mm:ss.SSS'}),
        format.printf((type) => `\n[${type.timestamp}] \n${type.level}: ${type.message}`)
      ),
    }),
  ]
});

/**
 * Formats objects or arrays into a JSON string with indentation for readability.
 * 
 * This utility function is useful for logging or debugging complex objects by converting them
 * into a well-formatted JSON string.
 * 
 * @param {Object | Array<any>} obj - The object or array to format.
 * @returns {string} A stringified version of the input object or array with 2-space indentation.
 * 
 * @example
 * const data = { key: "value", list: [1, 2, 3] };
 * console.log(formatObjects(data));
 * // Output:
 * // {
 * //   "key": "value",
 * //   "list": [
 * //     1,
 * //     2,
 * //     3
 * //   ]
 * // }
 */
export function formatObjects(obj: Object | Array<any>): string {
  return JSON.stringify(obj, null, 2);
}
