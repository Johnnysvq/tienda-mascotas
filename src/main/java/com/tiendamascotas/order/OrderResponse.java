package com.tiendamascotas.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.tiendamascotas.user.AppUser;

public record OrderResponse(
        Long id,
        OrderStatus status,
        PaymentMethod paymentMethod,
        BigDecimal total,
        String recipientName,
        String phoneNumber,
        String address,
        String notes,
        Instant createdAt,
        List<Line> items,
        List<Change> history,
        Customer customer) { // solo se rellena para administradores

    public record Line(Long productId, String description, BigDecimal unitPrice, int quantity, BigDecimal subtotal) {
    }

    // "by" (quién hizo el cambio) solo se muestra a administradores
    public record Change(OrderStatus from, OrderStatus to, Instant at, String by) {
    }

    public record Customer(Long id, String name, String email) {
    }

    static OrderResponse from(CustomerOrder order, boolean admin) {
        List<Line> lines = order.getItems().stream()
                .map(item -> new Line(
                        item.getProduct().getId(),
                        item.getProductDescription(),
                        item.getUnitPrice(),
                        item.getQuantity(),
                        item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()))))
                .toList();

        List<Change> history = order.getStatusChanges().stream()
                .map(change -> new Change(
                        change.getFromStatus(), change.getToStatus(), change.getChangedAt(),
                        admin ? change.getActor() : null))
                .toList();

        Customer customer = null;
        if (admin) {
            AppUser user = order.getUser();
            customer = new Customer(user.getId(), user.getFirstName() + " " + user.getLastName(), user.getEmail());
        }

        return new OrderResponse(order.getId(), order.getStatus(), order.getPaymentMethod(), order.getTotal(),
                order.getRecipientName(), order.getPhoneNumber(), order.getAddress(), order.getNotes(),
                order.getCreatedAt(), lines, history, customer);
    }
}