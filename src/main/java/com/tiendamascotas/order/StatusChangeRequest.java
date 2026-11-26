package com.tiendamascotas.order;

import jakarta.validation.constraints.NotNull;

public record StatusChangeRequest(@NotNull(message = "El estado es obligatorio") OrderStatus status) {

}
