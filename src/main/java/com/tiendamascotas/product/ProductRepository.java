package com.tiendamascotas.product;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @Override
    @EntityGraph(attributePaths = { "brand", "category", "petType", "provider" })
    Page<Product> findAll(Specification<Product> spec, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = { "brand", "category", "petType", "provider" })
    Optional<Product> findById(Long id);

    @Modifying
    @Query("update Product p set p.stock = p.stock - :quantity "
            + "where p.id = :id and p.status = com.tiendamascotas.product.ProductStatus.ACTIVE "
            + "and p.stock >= :quantity")
    int decrementStock(@Param("id") Long id, @Param("quantity") int quantity);

    @Modifying
    @Query("update Product p set p.stock = p.stock + :quantity where p.id = :id")
    int incrementStock(@Param("id") Long id, @Param("quantity") int quantity);
}
