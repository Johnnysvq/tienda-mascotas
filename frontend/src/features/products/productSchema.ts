import { z } from "zod";

export const productSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "La descripción es obligatoria")
    .max(200, "La descripción no puede superar los 200 caracteres"),
  detail: z
    .string()
    .trim()
    .max(2000, "El detalle no puede superar los 2000 caracteres"),
  price: z
    .string()
    .trim()
    .min(1, "El precio es obligatorio")
    .regex(
      /^\d{1,8}([.,]\d{1,2})?$/,
      "Usa hasta 8 enteros y 2 decimales (ej. 42500.50)",
    )
    .refine(
      (value) => Number(value.replace(",", ".")) > 0,
      "El precio debe ser mayor que cero",
    ),
  stock: z
    .string()
    .trim()
    .min(1, "El stock es obligatorio")
    .regex(/^\d{1,9}$/, "El stock debe ser un número entero de 0 o más"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  brandId: z.string().min(1, "Selecciona una marca"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  petTypeId: z.string().min(1, "Selecciona un tipo de mascota"),
  providerId: z.string().min(1, "Selecciona un proveedor"),
});

export type ProductFormValues = z.infer<typeof productSchema>