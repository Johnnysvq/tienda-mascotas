package com.tiendamascotas.product;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;

public class ProductSpecifications {

    private ProductSpecifications() {
    }

    static Specification<Product> from(ProductFilter filter, boolean includeInactive) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Los productos inactivos solo los ve el administrador
            if (!includeInactive) {
                predicates.add(cb.equal(root.get("status"), ProductStatus.ACTIVE));
            }
            if (filter.brandId() != null) {
                predicates.add(cb.equal(root.get("brand").get("id"), filter.brandId()));
            }
            if (filter.categoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), filter.categoryId()));
            }
            if (filter.petTypeId() != null) {
                predicates.add(cb.equal(root.get("petType").get("id"), filter.petTypeId()));
            }
            if (filter.query() != null) {
                String pattern = "%" + escapeLike(filter.query().toLowerCase(Locale.ROOT)) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.<String>get("description")), pattern, '\\'),
                        cb.like(cb.lower(root.get("brand").<String>get("name")), pattern, '\\')));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // Sin esto, buscar "%" o "_" devolvería todo el catálogo
    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
