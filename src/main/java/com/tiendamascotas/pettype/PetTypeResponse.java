package com.tiendamascotas.pettype;

public record PetTypeResponse(Long id, String name) {
    static PetTypeResponse from(PetType petType) {
        return new PetTypeResponse(petType.getId(), petType.getName());
    }
}
