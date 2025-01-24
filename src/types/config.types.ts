import {z} from 'zod'
/**
 * Defines and validates the schema for the Rex server configuration using the Zod validation library.
 * 
 * The schema includes:
 * - server configuration (listen ports).
 * - optional SSL configuration (certificate and key).
 * - workers configuration (either an integer or "auto").
 * - upstream server configurations (list of servers).
 * 
 * @example
 * const validConfig = configSchema.parse({
 *   server: { listen: [80, 443] },
 *   workers: 4,
 *   upstream: { servers: [{ host: 'http://localhost:8000' }] },
 * });
 */


const hostnameSchema = z
  .string()
  .regex(
    /^(localhost(:\d{1,5})?|https?:\/\/([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+(:\d{1,5})?)(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;%=]*)?$/,
    "Invalid hostname format"
  );


export const routesSchema =z.array(
    z.object({
    path:z.string(),
    destination:hostnameSchema
}))

export const serverInstanceSchema = z.object({
    port:z.number().min(0).max(65535),
    sslConfig:z.object({
        cert:z.string(),
        key:z.string()
    }).optional(),
    public:z.string().optional(),
    routes:routesSchema.optional()
})


export const configSchema = z.object({
    workers:z.union([z.number(),z.literal("auto")]),
    server:z.object({
      instances:z.array(serverInstanceSchema)
    }),
    upstream : z.array(hostnameSchema).optional(),
    initUpstream : z.number().optional()
})


export type ServerInstance = z.infer<typeof serverInstanceSchema>
export type REX_CONFIG = z.infer<typeof configSchema>
export type Routes = z.infer<typeof routesSchema>