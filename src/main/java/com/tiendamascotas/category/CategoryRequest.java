package com.tiendamascotas.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
    @NotBlank(message="El nombre de la categoría es obligatorio")
    @Size(max=100, message="El nombre de la categoría no puede tener más de 100 caracteres")
    String name) {
}
