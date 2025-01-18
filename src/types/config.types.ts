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

export const upstreamSchema = z.object({
    servers:z.array(
        z.object({
            host:z.string()
        })
    )
})

export const configSchema = z.object({
    server:z.object({
        listen:z.array(z.number().min(0).max(65535)),
    }),
    sslConfig:z.object({
      cert:z.string(),
      key:z.string()
    }).optional(),
    workers:z.union([z.number(),z.literal("auto")]),
    upstream : upstreamSchema
})

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

export const ErrorSchema = z.object({
  code: z.string(),
  errno:z.number().optional(),
  syscall:z.string().optional(),
  message: z.string().optional(),
  stack: z.string().optional(),
  port: z.number().optional(),
  address: z.union([z.string(),z.null()]).optional(),
});

export type NodeJsErr = z.infer<typeof ErrorSchema>
export type REX_CONFIG = z.infer<typeof configSchema>