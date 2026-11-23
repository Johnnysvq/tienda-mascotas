package com.tiendamascotas.product;

import com.tiendamascotas.common.exception.InvalidRequestException;

public record ProductFilter(Long brandId, Long categoryId, Long petTypeId, String query) {

    private static final int MAX_QUERY_LENGTH = 100;

    public static ProductFilter of(Long brandId, Long categoryId, Long petTypeId, String q) {
        String query = q == null ? null : q.trim();
        if (query != null && query.isEmpty()) {
            query = null;
        }
        if (query != null && query.length() > MAX_QUERY_LENGTH) {
            throw new InvalidRequestException("La búsqueda no puede superar los " + MAX_QUERY_LENGTH + " caracteres");
        }
        return new ProductFilter(brandId, categoryId, petTypeId, query);
    }
}
