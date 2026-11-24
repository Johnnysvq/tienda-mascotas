package com.tiendamascotas.cart;

import java.math.BigDecimal;
import java.util.List;

public record CartQuoteResponse(List<Line> items, BigDecimal total) {

    public enum LineStatus {
        OK, LIMITED, OUT_OF_STOCK, UNAVAILABLE
    }

    public record Line(
            Long productId,
            String description,
            String imageKey,
            BigDecimal unitPrice,
            int requestedQuantity,
            int quantity, // la que de verdad se puede comprar ahora
            int availableStock,
            LineStatus status,
            BigDecimal subtotal) {
        static Line unavailable(Long productId, int requestedQuantity) {
            return new Line(productId, null, null, null, requestedQuantity, 0, 0, LineStatus.UNAVAILABLE, null);
        }
    }
}
