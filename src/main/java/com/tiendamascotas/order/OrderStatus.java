package com.tiendamascotas.order;

import java.util.EnumSet;
import java.util.Set;

public enum OrderStatus {
    PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED;

    /** Estados a los que se puede pasar desde este. Los estados finales no tienen salida. */
    public Set<OrderStatus> allowedNext() {
        return switch (this) {
            case PENDING -> EnumSet.of(CONFIRMED, CANCELLED);
            case CONFIRMED -> EnumSet.of(SHIPPED, CANCELLED);
            case SHIPPED -> EnumSet.of(DELIVERED);
            case DELIVERED, CANCELLED -> EnumSet.noneOf(OrderStatus.class);
        };
    }

    public boolean canMoveTo(OrderStatus target) {
        return allowedNext().contains(target);
    }

    public String label() {
        return switch (this) {
            case PENDING -> "pendiente";
            case CONFIRMED -> "confirmado";
            case SHIPPED -> "enviado";
            case DELIVERED -> "entregado";
            case CANCELLED -> "cancelado";
        };
    }
}