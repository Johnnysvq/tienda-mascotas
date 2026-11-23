package com.tiendamascotas.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "El nombre es obligatorio") @Size(max = 100, message = "El nombre no puede superar los 100 caracteres") String firstName,

        @NotBlank(message = "Los apellidos son obligatorios") @Size(max = 100, message = "Los apellidos no pueden superar los 100 caracteres") String lastName,

        @NotBlank(message = "El correo es obligatorio") @Email(message = "El correo no tiene un formato válido") @Size(max = 150, message = "EL correo no puede superar los 150 caracteres") String email,

        @NotBlank(message = "La contraseña es obligatoria") @Size(min = 10, max = 64, message = "La contraseña debe tener entre 10 y 64 caracteres") String password,

        @Pattern(regexp = "^\\+?[0-9 \\-]{8,20}$", message = "El teléfono no tiene un formato válido") String phoneNumber) {

    // Evita que la contraseña aparezca en un log si alguien imprime este objeto
    @Override
    public String toString() {
        return "RegisterRequest[email=" + email + "]";
    }
}
