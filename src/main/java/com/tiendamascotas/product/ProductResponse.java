package com.tiendamascotas.product;

import java.math.BigDecimal;

public record ProductResponse(
    Long id,
    String description,
    String detail,
    BigDecimal price,
    int stock,
    ProductStatus status,
    String imageKey,
    Ref brand,
    Ref category,
    Ref petType) {
        public record Ref(Long id, String name){}
        static ProductResponse from(Product p) {
            return new ProductResponse(
                p.getId(),
                p.getDescription(),
                p.getDetail(),
                p.getPrice(),
                p.getStock(),
                p.getStatus(),
                p.getImageKey(),
                new Ref(p.getBrand().getId(), p.getBrand().getName()),
                new Ref(p.getCategory().getId(), p.getCategory().getName()),
                new Ref(p.getPetType().getId(), p.getPetType().getName()));
        }
}
