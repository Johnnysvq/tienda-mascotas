import { z } from 'zod'

export const brandSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'El nombre es obligatorio')
        .max(100, 'El nombre no puede superar los 100 caracteres'),
})

export type BrandFormValues = z.infer<typeof brandSchema>