package com.tiendamascotas.order;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tiendamascotas.common.exception.InvalidRequestException;
import com.tiendamascotas.common.exception.ResourceNotFoundException;
import com.tiendamascotas.common.exception.StateConflictException;
import com.tiendamascotas.common.exception.StockConflictException;
import com.tiendamascotas.product.ProductService;
import com.tiendamascotas.product.ProductSnapshot;
import com.tiendamascotas.product.ProductStatus;
import com.tiendamascotas.user.AppUser;
import com.tiendamascotas.user.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final int MAX_QUANTITY = 99;
    private static final int MAX_PENDING_ORDERS = 5;

    private final CustomerOrderRepository repository;
    private final ProductService productService;
    private final UserService userService;

    @Transactional
    public OrderResponse create(String email, OrderRequest request, String idempotencyKey) {
        String key = parseKey(idempotencyKey);

        // Un reintento con la misma clave devuelve el pedido ya creado, sin duplicarlo
        Optional<CustomerOrder> existing = repository.findByUser_EmailIgnoreCaseAndIdempotencyKey(email, key);
        if (existing.isPresent()) {
            return OrderResponse.from(existing.get(), false);
        }

        if (repository.countByUser_EmailIgnoreCaseAndStatus(email, OrderStatus.PENDING) >= MAX_PENDING_ORDERS) {
            throw new InvalidRequestException(
                    "Ya tienes " + MAX_PENDING_ORDERS
                            + " pedidos pendientes. Espera a que se atiendan para hacer otro.");
        }

        // Un producto repetido se suma; el TreeMap fija un orden estable (por id) de
        // actualización
        Map<Long, Integer> requested = new TreeMap<>();
        for (OrderRequest.Line line : request.items()) {
            requested.merge(line.productId(), line.quantity(), Integer::sum);
        }
        if (requested.values().stream().anyMatch(quantity -> quantity > MAX_QUANTITY)) {
            throw new InvalidRequestException("La cantidad máxima por producto es " + MAX_QUANTITY);
        }

        Map<Long, ProductSnapshot> products = productService.findSnapshots(requested.keySet());

        // Primera pasada: se detectan todos los productos con problema para avisar de
        // una sola vez
        List<Long> unavailable = requested.entrySet().stream()
                .filter(entry -> {
                    ProductSnapshot product = products.get(entry.getKey());
                    return product == null
                            || product.status() != ProductStatus.ACTIVE
                            || product.stock() < entry.getValue();
                })
                .map(Map.Entry::getKey)
                .toList();
        if (!unavailable.isEmpty()) {
            throw new StockConflictException(unavailable);
        }

        AppUser user = userService.requireByEmail(email);

        CustomerOrder order = new CustomerOrder();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(request.paymentMethod());
        order.setRecipientName(request.recipientName().trim());
        order.setPhoneNumber(request.phoneNumber().trim());
        order.setAddress(request.address().trim());
        order.setNotes(blankToNull(request.notes()));
        order.setIdempotencyKey(key);

        // Segunda pasada: el descuento real. Si otra compra se adelantó, la transacción
        // se deshace entera
        BigDecimal total = BigDecimal.ZERO;
        for (Map.Entry<Long, Integer> entry : requested.entrySet()) {
            Long productId = entry.getKey();
            int quantity = entry.getValue();
            ProductSnapshot product = products.get(productId);

            if (!productService.tryReserveStock(productId, quantity)) {
                throw new StockConflictException(List.of(productId));
            }

            OrderItem item = new OrderItem();
            item.setProduct(productService.getReference(productId));
            item.setProductDescription(product.description());
            item.setUnitPrice(product.price());
            item.setQuantity(quantity);
            order.addItem(item);

            total = total.add(product.price().multiply(BigDecimal.valueOf(quantity)));
        }
        order.setTotal(total);

        return OrderResponse.from(repository.save(order), false);
    }

    @Transactional(readOnly = true)
    public Page<OrderSummary> listMine(String email, Pageable pageable) {
        return repository.findByUser_EmailIgnoreCase(email, pageable).map(OrderSummary::from);
    }

    // Si el pedido es de otro cliente se responde "no encontrado", igual que si no
    // existiera
    @Transactional(readOnly = true)
    public OrderResponse getMine(String email, Long id) {
        return repository.findByIdAndUser_EmailIgnoreCase(id, email)
                .map(order -> OrderResponse.from(order, false))
                .orElseThrow(() -> new ResourceNotFoundException("Pedido con id " + id + " no encontrado"));
    }

    // ---------- Administración ----------

    @Transactional(readOnly = true)
    public Page<AdminOrderSummary> listAll(OrderStatus status, Pageable pageable) {
        Page<CustomerOrder> page = status == null
                ? repository.findAll(pageable)
                : repository.findByStatus(status, pageable);
        return page.map(AdminOrderSummary::from);
    }

    @Transactional(readOnly = true)
    public OrderResponse getForAdmin(Long id) {
        return repository.findWithDetailsById(id)
                .map(order -> OrderResponse.from(order, true))
                .orElseThrow(() -> notFound(id));
    }

    @Transactional
    public OrderResponse changeStatus(Long id, OrderStatus target, String actor) {
        // Con la fila bloqueada, dos cambios simultáneos se ejecutan uno tras otro
        CustomerOrder order = repository.findForUpdate(id).orElseThrow(() -> notFound(id));
        applyTransition(order, target, actor);
        repository.flush(); // asigna la fecha del cambio antes de armar la respuesta
        return OrderResponse.from(order, true);
    }

    // ---------- Cliente ----------

    @Transactional
    public OrderResponse cancelMine(String email, Long id) {
        // La pertenencia se comprueba ANTES de bloquear: un cliente no puede bloquear
        // pedidos ajenos
        if (!repository.existsByIdAndUser_EmailIgnoreCase(id, email)) {
            throw notFound(id);
        }
        CustomerOrder order = repository.findForUpdate(id).orElseThrow(() -> notFound(id));
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new StateConflictException(
                    "Solo se pueden cancelar pedidos pendientes. Este pedido ya está "
                            + order.getStatus().label() + "; contacta a la tienda.");
        }
        applyTransition(order, OrderStatus.CANCELLED, email);
        repository.flush();
        return OrderResponse.from(order, false);
    }

    // ---------- Comunes ----------

    private void applyTransition(CustomerOrder order, OrderStatus target, String actor) {
        OrderStatus current = order.getStatus();
        if (!current.canMoveTo(target)) {
            throw new StateConflictException(
                    "El pedido está " + current.label() + " y no puede pasar a " + target.label() + ".");
        }

        if (target == OrderStatus.CANCELLED) {
            releaseStock(order);
        }

        order.setStatus(target);
        OrderStatusChange change = new OrderStatusChange();
        change.setFromStatus(current);
        change.setToStatus(target);
        change.setActor(actor);
        order.addStatusChange(change);
    }

    // Mismo orden (por id) que al comprar, para no provocar bloqueos cruzados entre
    // transacciones
    private void releaseStock(CustomerOrder order) {
        order.getItems().stream()
                .sorted(Comparator.comparing(item -> item.getProduct().getId()))
                .forEach(item -> productService.releaseStock(item.getProduct().getId(), item.getQuantity()));
    }

    private static ResourceNotFoundException notFound(Long id) {
        return new ResourceNotFoundException("Pedido con id " + id + " no encontrado");
    }

    private static String parseKey(String value) {
        try {
            return UUID.fromString(value).toString();
        } catch (IllegalArgumentException e) {
            throw new InvalidRequestException("Identificador de operación no válido");
        }
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
