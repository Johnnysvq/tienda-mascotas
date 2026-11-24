package com.tiendamascotas.cart;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.tiendamascotas.product.ProductService;
import com.tiendamascotas.product.ProductSnapshot;
import com.tiendamascotas.product.ProductStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {

    private static final int MAX_QUANTITY = 99;

    private final ProductService productService;

    public CartQuoteResponse quote(CartQuoteRequest request) {
        Map<Long, Integer> requested = new LinkedHashMap<>();
        for (CartQuoteRequest.Line line : request.items()) {
            requested.merge(line.productId(), line.quantity(), Integer::sum);
        }

        Map<Long, ProductSnapshot> products = productService.findSnapchots(requested.keySet());
        List<CartQuoteResponse.Line> lines = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (Map.Entry<Long, Integer> entry : requested.entrySet()) {
            Long id = entry.getKey();
            int wanted = Math.min(entry.getValue(), MAX_QUANTITY);
            ProductSnapshot product = products.get(id);

            // Inactivo e inexistente reciben la misma respuesta
            if (product == null || product.status() != ProductStatus.ACTIVE) {
                lines.add(CartQuoteResponse.Line.unavailable(id, wanted));
                continue;
            }

            int quantity = Math.min(wanted, product.stock());
            CartQuoteResponse.LineStatus status = product.stock() == 0
                    ? CartQuoteResponse.LineStatus.OUT_OF_STOCK
                    : quantity < wanted ? CartQuoteResponse.LineStatus.LIMITED : CartQuoteResponse.LineStatus.OK;
            BigDecimal subtotal = product.price().multiply(BigDecimal.valueOf(quantity));
            total = total.add(subtotal);

            lines.add(new CartQuoteResponse.Line(id, product.description(), product.imageKey(), product.price(), wanted,
                    quantity, product.stock(), status, subtotal));
        }
        return new CartQuoteResponse(lines, total);
    }
}
