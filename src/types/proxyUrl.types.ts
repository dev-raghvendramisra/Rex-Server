import { URL } from "url";
import { join } from "path";

/**
 * A class that extends the native `URL` class to represent a proxy URL with an optional path.
 * 
 * This class extends the `URL` class to provide a more specific implementation for handling proxy URLs,
 * with an optional path parameter that can be included in the URL construction.
 * 
 * The `urlString` property holds the base URL string that was provided during construction, and the class
 * allows manipulation of the URL using standard `URL` methods and properties.
 * 
 * @class ProxyURL
 * @extends {URL}
 */
export class ProxyURL extends URL {
  urlString: string;

  /**
   * Creates an instance of the `ProxyURL` class.
   * 
   * The constructor takes a base URL and an optional path. If the path is provided, it will be appended
   * to the base URL. If no path is provided, the URL is constructed using only the base URL.
   * 
   * @param {string} baseUrl - The base URL (e.g., `http://localhost`).
   * @param {string} [path] - An optional path to append to the base URL (e.g., `/api`).
   */
  constructor(baseUrl: string, path?: string) {
    if (path) {
      super(path, baseUrl);  // If path is provided, construct the URL with it
    } else {
      super(baseUrl);  // Otherwise, use just the base URL
    }
    this.urlString = join(baseUrl,path ? path : '');  // Store the base URL string
  }
}
