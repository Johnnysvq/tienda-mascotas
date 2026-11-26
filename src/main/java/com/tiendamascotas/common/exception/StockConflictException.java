package com.tiendamascotas.common.exception;

import java.util.List;

public class StockConflictException extends RuntimeException {

    private final List<Long> productIds;

    public StockConflictException(List<Long> productIds) {
        super("Algunos productos ya no están disponibles en la cantidad pedida. Revisa tu carrito.");
        this.productIds = List.copyOf(productIds);
    }

    public List<Long> getProductIds() {
        return productIds;
    }
}
