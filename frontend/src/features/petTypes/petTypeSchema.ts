import { z } from 'zod'
 
export const petTypeSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'El nombre es obligatorio')
        .max(100, 'El nombre no puede superar los 100 caracteres')
})

export type PetTypeFormValues = z.infer<typeof petTypeSchema>