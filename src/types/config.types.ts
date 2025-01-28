import { z } from 'zod';

/**
 * Schema for validating hostnames, including:
 * - `localhost` with optional port.
 * - URLs starting with `http://` or `https://` followed by a valid domain and optional port.
 * 
 * The hostname can also include an optional path and query string.
 * 
 * @example
 * hostnameSchema.parse("http://localhost:8080");
 */
const hostnameSchema = z
  .string()
  .regex(
    /^(localhost(:\d{1,5})?|https?:\/\/([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+(:\d{1,5})?)(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;%=]*)?$/,
    "Invalid hostname format"
  );

/**
 * Schema for validating the `routes` configuration.
 * 
 * The `routes` array consists of objects, each with:
 * - `path`: The URL path (e.g., `/api`).
 * - `destination`: The destination hostname, validated using `hostnameSchema`.
 * 
 * @example
 * routesSchema.parse([{ path: "/api", destination: "http://localhost:8080" }]);
 */
export const routesSchema = z.array(
  z.object({
    path: z.string(),
    destination: hostnameSchema,
  })
);

/**
 * Schema for validating a server instance configuration.
 * 
 * Each `serverInstance` object includes:
 * - `port`: The port the server should listen on, within the valid range (0-65535).
 * - `sslConfig`: Optional SSL configuration (including `cert` and `key` paths).
 * - `public`: Optional path to serve static files from.
 * - `routes`: Optional routes configuration (validated using `routesSchema`).
 * 
 * @example
 * serverInstanceSchema.parse({
 *   port: 80,
 *   sslConfig: { cert: "cert.pem", key: "key.pem" },
 *   public: "/path/to/static",
 *   routes: [{ path: "/api", destination: "http://localhost:8080" }]
 * });
 */
export const serverInstanceSchema = z.object({
  /**
   * The port the server should listen on (0-65535).
   * 
   * @type {number}
   */
  port: z.number().min(0).max(65535),

  caching : z.union([z.literal("DESABLED"),z.literal("RESPECT"),z.literal("OVERRIDE")]).optional().default("DESABLED"),
  /**
   * The SSL configuration for the server (optional).
   * 
   * The `sslConfig` object includes:
   * - `cert`: Path to the SSL certificate.
   * - `key`: Path to the SSL key.
   * 
   * @type {{ cert: string, key: string } | undefined}
   */
  sslConfig: z
    .object({
      cert: z.string(),
      key: z.string(),
    })
    .optional(),

  /**
   * The path to the public directory to serve static files (optional).
   * 
   * @type {string | undefined}
   */
  public: z.string().optional(),

  /**
   * The routes configuration (optional).
   * 
   * The `routes` array is validated using `routesSchema`.
   * 
   * @type {Array<{ path: string, destination: string }> | undefined}
   */
  routes: routesSchema.optional(),
});

/**
 * Schema for validating the main configuration object (`configSchema`).
 * 
 * The `configSchema` object includes:
 * - `workers`: The number of workers, or "auto" for automatic worker count.
 * - `server`: The server configuration, including the list of `server instances`.
 * - `upstream`: Optional list of upstream hostnames.
 * - `initUpstream`: Optional index to select the initial upstream server.
 * 
 * @example
 * configSchema.parse({
 *   workers: "auto",
 *   server: { instances: [{ port: 80, routes: [{ path: "/api", destination: "http://localhost:8080" }] }] },
 *   upstream: ["http://localhost:8081"],
 * });
 */
export const configSchema = z.object({
  /**
   * The number of workers or "auto" for automatic worker count.
   * 
   * @type {number | "auto"}
   */
  workers: z.union([z.number(), z.literal("auto")]),

  /**
   * The server configuration, including instances.
   * 
   * @type {{ instances: Array<typeof serverInstanceSchema> }}
   */
  server: z.object({
    instances: z.array(serverInstanceSchema),
  }),

  /**
   * The upstream hostnames for load balancing (optional).
   * 
   * @type {string[] | undefined}
   */
  upstream: z.array(hostnameSchema).optional(),

  /**
   * The index of the initial upstream server to use (optional).
   * 
   * @type {number | undefined}
   */
  initUpstream: z.number().optional(),
});

/**
 * Type representing a server instance configuration as inferred from the `serverInstanceSchema`.
 * 
 * @example
 * const instance: ServerInstance = {
 *   port: 80,
 *   sslConfig: { cert: "cert.pem", key: "key.pem" },
 *   public: "/path/to/static",
 *   routes: [{ path: "/api", destination: "http://localhost:8080" }]
 * };
 */
export type ServerInstance = z.infer<typeof serverInstanceSchema>;

/**
 * Type representing the main configuration object (`REX_CONFIG`) as inferred from the `configSchema`.
 * 
 * @example
 * const config: REX_CONFIG = {
 *   workers: "auto",
 *   server: { instances: [{ port: 80, routes: [{ path: "/api", destination: "http://localhost:8080" }] }] },
 *   upstream: ["http://localhost:8081"],
 * };
 */
export type REX_CONFIG = z.infer<typeof configSchema>;

/**
 * Type representing the routes configuration as inferred from the `routesSchema`.
 * 
 * @example
 * const routes: Routes = [{ path: "/api", destination: "http://localhost:8080" }];
 */
export type Routes = z.infer<typeof routesSchema>;
