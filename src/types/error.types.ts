import {z} from 'zod'

export const ErrorSchema = z.object({
    code: z.string(),
    errno:z.number().optional(),
    syscall:z.string().optional(),
    message: z.string().optional(),
    stack: z.string().optional(),
    port: z.number().optional(),
    path:z.string().optional(),
    address: z.union([z.string(),z.null()]).optional(),
  });

  export type NodeJsErr = z.infer<typeof ErrorSchema>
  