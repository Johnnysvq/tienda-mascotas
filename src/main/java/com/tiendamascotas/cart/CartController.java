package com.tiendamascotas.cart;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor 
public class CartController {

    private final CartService service;

    @PostMapping("/quote")
    public CartQuoteResponse quote(@Valid @RequestBody CartQuoteRequest request) {
        return service.quote(request);
    }
}
