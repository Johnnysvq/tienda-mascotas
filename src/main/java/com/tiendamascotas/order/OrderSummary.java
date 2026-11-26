package com.tiendamascotas.order;

import java.math.BigDecimal;
import java.time.Instant;

public record OrderSummary(Long id, OrderStatus status, BigDecimal total, Instant createdAt) {
    static OrderSummary from(CustomerOrder order) {
        return new OrderSummary(order.getId(), order.getStatus(), order.getTotal(), order.getCreatedAt());
    }
}
