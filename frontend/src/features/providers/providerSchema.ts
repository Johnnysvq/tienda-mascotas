import { z } from 'zod'

export const providerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'El nombre es obligatorio')
        .max(100, 'El nombre no puede superar los 100 caracteres'),
    phoneNumber: z
        .string()
        .trim()
        .refine((value) => value === '' || /^\+?[0-9 -]{8,20}$/.test(value), 'El teléfono no tiene un formato válido'),
    email: z
        .string()
        .trim()
        .min(1, 'El correo es obligatorio')
        .max(150, 'El correo no puede superar los 150 caracteres')
        .pipe(z.email('El correo no tiene un formato válido')),
})

export type ProviderFormValues = z.infer<typeof providerSchema>