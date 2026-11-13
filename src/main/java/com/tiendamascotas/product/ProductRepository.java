package com.tiendamascotas.product;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Override 
    @EntityGraph(attributePaths = {"brand", "category", "petType", "provider"})
    Page<Product> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"brand", "category", "petType", "provider"})
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"brand", "category", "petType", "provider"})
    Optional<Product> findById(Long id);
}
