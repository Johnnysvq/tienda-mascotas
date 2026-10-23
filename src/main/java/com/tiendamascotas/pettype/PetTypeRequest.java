package com.tiendamascotas.pettype;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PetTypeRequest(
    @NotBlank 
    @Size(max = 100, message = "El nombre no puede tener más de 100 caracteres")
    String name) {

}
