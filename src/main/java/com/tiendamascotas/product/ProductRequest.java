package com.tiendamascotas.product;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProductRequest(

    @NotBlank(message = "La descripción del producto es obligatoria")
    @Size(max = 200, message = "La descripción del producto no puede superar los 200 caracteres")
    String description,

    @Size(max = 2000, message = "El detalle no puede superar los 2000 caracteres")
    String detail,

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor a 0")
    @Digits(integer = 8, fraction = 2, message = "El precio admite hasta 8 enteros y 2 decimales")
    BigDecimal price,

    @NotNull(message = "El stock es obligatorio")
    @PositiveOrZero(message = "El stock no puede ser negativo")
    Integer stock,

    @NotNull(message = "El estado es obligatorio")
    ProductStatus status,

    // Solo http o una ruta propia que empiece con una sola "/"
    @Size(max = 500, message = "La URL de la imagen no puede superar los 500 caracteres")
    @Pattern(regexp = "^(https://\\S+|/(?!/)\\S*)$", message = "La imagen debe ser una URL https o una ruta que empiece con /")
    String imageUrl,

    @NotNull(message = "La marca es obligatoria") @Positive Long brandId,
    @NotNull(message = "La categoría es obligatoria") @Positive Long categoryId,
    @NotNull(message = "El tipo de mascota es obligatorio") @Positive Long petTypeId,
    @NotNull(message = "El proveedor es obligatorio") @Positive Long providerId
) {

}
