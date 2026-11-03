package com.tiendamascotas.provider;

import java.time.Instant;

public record ProviderResponse(Long id, String name, String phoneNumber, String email, Instant createdAt) {

    static ProviderResponse from(Provider provider) {
        return new ProviderResponse(provider.getId(), provider.getName(), provider.getPhoneNumber(), provider.getEmail(), provider.getCreatedAt());
    }
}
