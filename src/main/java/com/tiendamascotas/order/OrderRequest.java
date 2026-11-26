package com.tiendamascotas.order;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record OrderRequest(
        @NotEmpty(message = "El pedido no tiene productos") @Size(max = 50, message = "El pedido admite como máximo 50 productos distintos") List<@NotNull @Valid Line> items,

        @NotBlank(message = "El nombre de quien recibe es obligatorio") @Size(max = 100, message = "El nombre no puede superar los 100 caracteres") String recipientName,

        @NotBlank(message = "El teléfono es obligatorio") @Pattern(regexp = "^\\+?[0-9 \\-]{8,20}$", message = "El teléfono no tiene un formato válido") String phoneNumber,

        @NotBlank(message = "La dirección es obligatoria") @Size(min = 10, max = 300, message = "La dirección debe tener entre 10 y 300 caracteres") String address,

        @Size(max = 500, message = "Las notas no pueden superar los 500 caracteres") String notes,

        @NotNull(message = "Selecciona un método de pago") PaymentMethod paymentMethod) {
    public record Line(
            @NotNull @Positive Long productId,
            @NotNull @Min(1) @Max(99) Integer quantity) {
    }
}
