package com.tiendamascotas.brand;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BrandRequest(
    @NotBlank(message = "El nombre de la marca es obligatorio")
    @Size(max = 100, message = "El nombre de la marca no puede tener más de 100 caracteres")
    String name) {

}
