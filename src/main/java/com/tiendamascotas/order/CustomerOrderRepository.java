package com.tiendamascotas.order;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    // --- Cliente ---

    @EntityGraph(attributePaths = "items")
    Optional<CustomerOrder> findByIdAndUser_EmailIgnoreCase(Long id, String email);

    @EntityGraph(attributePaths = "items")
    Optional<CustomerOrder> findByUser_EmailIgnoreCaseAndIdempotencyKey(String email, String idempotencyKey);

    Page<CustomerOrder> findByUser_EmailIgnoreCase(String email, Pageable pageable);

    long countByUser_EmailIgnoreCaseAndStatus(String email, OrderStatus status);

    boolean existsByIdAndUser_EmailIgnoreCase(Long id, String email);

    // --- Administración ---

    @Override
    @EntityGraph(attributePaths = "user")
    Page<CustomerOrder> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "user")
    Page<CustomerOrder> findByStatus(OrderStatus status, Pageable pageable);

    @EntityGraph(attributePaths = { "items", "user" })
    Optional<CustomerOrder> findWithDetailsById(Long id);

    // --- Cambios de estado: bloquea la fila hasta terminar la transacción ---

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from CustomerOrder o where o.id = :id")
    Optional<CustomerOrder> findForUpdate(@Param("id") Long id);
}
