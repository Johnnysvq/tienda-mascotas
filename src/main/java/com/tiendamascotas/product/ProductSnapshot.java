package com.tiendamascotas.product;

import java.math.BigDecimal;

public record ProductSnapshot(
    Long id,
    String description,
    String imageKey,
    BigDecimal price,
    int stock,
    ProductStatus status
) {
}
