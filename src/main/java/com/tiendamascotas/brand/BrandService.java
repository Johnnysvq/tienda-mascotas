package com.tiendamascotas.brand;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tiendamascotas.common.exception.DuplicateResourceException;
import com.tiendamascotas.common.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class BrandService {
    
    private final BrandRepository repository;

    @Transactional(readOnly = true)
    public Page<BrandResponse> findAll(Pageable pageable) {
        return repository.findAll(pageable).map(BrandResponse::from);
    }

    @Transactional(readOnly = true)
    public BrandResponse findById(Long id) {
        return BrandResponse.from(getOrThrow(id));
    }

    @Transactional
    public BrandResponse create(BrandRequest request) {
        String name = request.name().trim();
        if (repository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Ya existe una marca con el nombre '" + name + "'");
        }

        Brand brand = new Brand();
        brand.setName(name);
        return BrandResponse.from(repository.save(brand));
    }

    @Transactional
    public BrandResponse update(Long id, BrandRequest request) {
        Brand brand = getOrThrow(id);
        String name = request.name().trim();
        if (repository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new DuplicateResourceException("Ya existe una marca con el nombre '" + name + "'");
        }
        brand.setName(name);
        return BrandResponse.from(brand);
    }

    @Transactional
    public void delete(Long id){
        repository.delete(getOrThrow(id));
    }

    private Brand getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Marca con id " + id + " no encontrada"));
    }
}
