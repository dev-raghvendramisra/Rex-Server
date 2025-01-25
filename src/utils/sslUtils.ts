import { readFileSync } from "fs";
import crypto, { X509Certificate } from "crypto";
import { formatObjects, logger } from "@lib";

/**
 * Retrieves the SSL configuration by reading the certificate and key files.
 * 
 * This function takes an object with paths to the SSL certificate and key files,
 * reads the files synchronously, and returns an SSL configuration object containing:
 * - The certificate content
 * - The private key content
 * - SSL options to disable SSLv2 and SSLv3 for improved security.
 * 
 * @param {Object} sslConfig - An object containing the paths to the SSL certificate and private key files.
 * @param {string} sslConfig.cert - The path to the SSL certificate file.
 * @param {string} sslConfig.key - The path to the SSL private key file.
 * 
 * @returns {Object} An object containing:
 * - `cert` (Buffer): The content of the SSL certificate file.
 * - `key` (Buffer): The content of the SSL private key file.
 * - `secureOptions` (number): Security options to disable SSLv2 and SSLv3.
 * 
 * @throws {Error} If there is an issue reading the certificate or key files.
 * 
 * @example
 * const sslConfig = getSSLConfig({ cert: '/path/to/cert.pem', key: '/path/to/key.pem' });
 * console.log(sslConfig.cert); // Outputs the SSL certificate content.
 * console.log(sslConfig.key);  // Outputs the SSL private key content.
 */
export function getSSLConfig(sslConfig: { cert: string; key: string }) {
  const cert = readFileSync(sslConfig.cert);
  const key = readFileSync(sslConfig.key);

  return {
    cert,
    key,
    secureOptions: crypto.constants.SSL_OP_NO_SSLv2 | crypto.constants.SSL_OP_NO_SSLv3,
  };
}

/**
 * Extracts the hostname from an SSL certificate file.
 *
 * @param certPath - The file path to the SSL certificate.
 * @returns The hostname extracted from the certificate. If extraction fails, returns 'localhost'.
 *
 * @throws Will log an error and return 'localhost' if an error occurs during extraction.
 */
export function getHostnameFromSSL(certPath : string){
  try {
    const fullCert = readFileSync(certPath,'utf-8')
    const websiteCert = fullCert.split("-----END CERTIFICATE-----")[0].trim()+"\n-----END CERTIFICATE-----"
    const cert = new X509Certificate(websiteCert)
    const hostname = cert.subject.split("CN=")[1]
    return hostname || "localhost"
  } catch (error) {
    logger.error(`AN_ERROR_OCCURED_WHILE_EXTRACTING_HOST_FROM_CERT ${formatObjects(error as Object)}`)
    return 'localhost'
  }
}