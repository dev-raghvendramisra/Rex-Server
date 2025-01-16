import {z} from 'zod'

export const upstreamSchema = z.object({
    servers:z.array(
        z.object({
            host:z.string()
        })
    )
})

export const configSchema = z.object({
    server:z.object({
        listen:z.array(z.number()),
    }),
    sslConfig:z.object({
      cert:z.string(),
      key:z.string()
    }).optional(),
    workers:z.union([z.number(),z.literal("auto")]),
    upstream : upstreamSchema
})

export type rex_config = z.infer<typeof configSchema>