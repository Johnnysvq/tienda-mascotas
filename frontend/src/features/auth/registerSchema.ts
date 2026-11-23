import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio")
      .max(100, "El nombre no puede superar los 100 caracteres"),
    lastName: z
      .string()
      .trim()
      .min(1, "Los apellidos son obligatorios")
      .max(100, "Los apellidos no pueden superar los 100 caracteres"),
    email: z
      .string()
      .trim()
      .min(1, "El correo es obligatorio")
      .max(150, "El correo no puede superar los 150 caracteres")
      .pipe(z.email("El correo no tiene un formato válido")),
    phoneNumber: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || /^\+?[0-9 -]{8,20}$/.test(value),
        "El teléfono no tiene un formato válido",
      ),
    password: z
      .string()
      .min(10, "La contraseña debe tener al menos 10 caracteres")
      .max(64, "La contraseña no puede superar los 64 caracteres")
      .refine(
        (value) => new TextEncoder().encode(value).length <= 72,
        "La contraseña es demasiado larga",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;
