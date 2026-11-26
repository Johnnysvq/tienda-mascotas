import { z } from 'zod'

export const checkoutSchema = z.object({
  recipientName: z
    .string()
    .trim()
    .min(1, 'El nombre de quien recibe es obligatorio')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  phoneNumber: z
    .string()
    .trim()
    .min(1, 'El teléfono es obligatorio')
    .regex(/^\+?[0-9 -]{8,20}$/, 'El teléfono no tiene un formato válido'),
  address: z
    .string()
    .trim()
    .min(10, 'Escribe la dirección completa (mínimo 10 caracteres)')
    .max(300, 'La dirección no puede superar los 300 caracteres'),
  notes: z.string().trim().max(500, 'Las notas no pueden superar los 500 caracteres'),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'SINPE_MOVIL'], { error: 'Selecciona un método de pago' }),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>