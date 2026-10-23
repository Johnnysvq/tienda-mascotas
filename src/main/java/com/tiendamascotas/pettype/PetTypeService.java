package com.tiendamascotas.pettype;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tiendamascotas.common.exception.DuplicateResourceException;
import com.tiendamascotas.common.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class PetTypeService {

    private final PetTypeRepository repository;

    @Transactional(readOnly = true)
    public Page<PetTypeResponse> findAll(Pageable pageable) {
        return repository.findAll(pageable).map(PetTypeResponse::from);
    }

    @Transactional(readOnly = true)
    public PetTypeResponse findById(Long id) {
        return PetTypeResponse.from(getOrThrow(id));
    }

    @Transactional
    public PetTypeResponse create(PetTypeRequest request) {
        String name = request.name().trim();
        if (repository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Ya existe un tipo de mascota con el nombre '" + name + "'");
        }
        PetType petType = new PetType();
        petType.setName(name);
        return PetTypeResponse.from(repository.save(petType));
    }

    @Transactional 
    public PetTypeResponse update(Long id, PetTypeRequest request) {
        PetType petType = getOrThrow(id);
        String name = request.name().trim();
        if (repository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new DuplicateResourceException("Ya existe un tipo de mascota con el nombre '" + name + "'");
        }
        petType.setName(name);
        return PetTypeResponse.from(petType);
    }

    @Transactional 
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private PetType getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el tipo de mascota con id: " + id));
    }
}
