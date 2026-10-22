package com.tiendamascotas.brand;

public record BrandResponse(Long id, String name) {

    static BrandResponse from(Brand brand) {
        return new BrandResponse(brand.getId(), brand.getName());
    }
}
