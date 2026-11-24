package com.tiendamascotas.cart;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CartQuoteRequest(
        @NotEmpty(message = "El carrito está vacío") @Size(max = 50, message = "El carrito admite como máximo 50 productos distintos") List<@NotNull @Valid Line> items) {
    public record Line(
            @NotNull @Positive Long productId,
            @NotNull @Min(1) @Max(99) Integer quantity) {

    }
}
