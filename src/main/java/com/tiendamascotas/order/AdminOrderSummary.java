package com.tiendamascotas.order;

import java.math.BigDecimal;
import java.time.Instant;

import com.tiendamascotas.user.AppUser;

public record AdminOrderSummary(Long id, OrderStatus status, BigDecimal total, Instant createdAt, String customerName) {
    static AdminOrderSummary from(CustomerOrder order) {
        AppUser user = order.getUser();
        return new AdminOrderSummary(order.getId(), order.getStatus(), order.getTotal(), order.getCreatedAt(),
                user.getFirstName() + " " + user.getLastName());
    }
}
