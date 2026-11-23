package com.tiendamascotas.common.web;

import java.util.Set;
import java.util.TreeSet;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.tiendamascotas.common.exception.InvalidRequestException;

public final class SortRules {

    private static final int MAX_ORDERS = 3;

    private SortRules() {

    }

    public static Pageable validate(Pageable pageable, Set<String> allowedProperties) {
        long count = 0;
        for (Sort.Order order : pageable.getSort()) {
            count++;
            if (!allowedProperties.contains(order.getProperty())) {
                throw new InvalidRequestException(
                    "Campo de ordenación no permitido. Campos válidos: "
                            + String.join(", ", new TreeSet<>(allowedProperties)));
            }
        }
        if (count > MAX_ORDERS) {
            throw new InvalidRequestException("Se admiten como máximo " + MAX_ORDERS + " criterios de orden");
        }
        return pageable;
    }
}