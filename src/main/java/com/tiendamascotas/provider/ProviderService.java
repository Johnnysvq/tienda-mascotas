package com.tiendamascotas.provider;

import java.util.Locale;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tiendamascotas.common.exception.DuplicateResourceException;
import com.tiendamascotas.common.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class ProviderService {

    private final ProviderRepository repository;

    @Transactional(readOnly = true)
    public Page<ProviderResponse> findAll(Pageable pageable) {
        return repository.findAll(pageable).map(ProviderResponse::from);
    }

    @Transactional(readOnly = true)
    public ProviderResponse findById(Long id) {
        return ProviderResponse.from(getOrThrow(id));
    }

    @Transactional
    public ProviderResponse create(ProviderRequest request) {
        String name = request.name().trim();
        if (repository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Ya existe un proveedor con el nombre '" + name + "'");
        }
        Provider provider = new Provider();
        apply(provider, request);
        return ProviderResponse.from(repository.save(provider));
    }

    @Transactional 
    public ProviderResponse update(Long id, ProviderRequest request) {
        Provider provider = getOrThrow(id);
        String name = request.name().trim();
        if (repository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new DuplicateResourceException("Ya existe un proveedor con el nombre '" + name + "'");
        }
        apply(provider, request);
        return ProviderResponse.from(provider);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private void apply(Provider provider, ProviderRequest request) {
        provider.setName(request.name().trim());
        provider.setPhoneNumber(blankToNull(request.phoneNumber()));
        provider.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private Provider getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor con id " + id + " no encontrado"));
    }
}
