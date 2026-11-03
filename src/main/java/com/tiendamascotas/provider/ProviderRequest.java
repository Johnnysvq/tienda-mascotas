package com.tiendamascotas.provider;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProviderRequest(
    @NotBlank(message = "El nombre del proveedor es obligatorio")
    @Size(max = 100, message = "El nombre del proveedor no puede tener más de 100 caracteres")
    String name,
    
    @Pattern(regexp = "^\\+?[0-9 \\-]{8,20}$", message = "El teléfono no tiene un formato válido")
    String phoneNumber,

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no tiene un formato válido")
    @Size(max = 150, message = "El correo no puede superar los 150 caracteres")
    String email) {

}
