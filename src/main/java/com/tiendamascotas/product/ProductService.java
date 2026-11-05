package com.tiendamascotas.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tiendamascotas.brand.BrandService;
import com.tiendamascotas.category.CategoryService;
import com.tiendamascotas.common.exception.ResourceNotFoundException;
import com.tiendamascotas.pettype.PetTypeService;
import com.tiendamascotas.provider.ProviderService;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repository;
    private final BrandService brandService;
    private final CategoryService categoryService;
    private final PetTypeService petTypeService;
    private final ProviderService providerService;

    @Transactional(readOnly = true)
    public Page<ProductResponse> findAll(Pageable pageable, boolean includeInactive) {
        Page<Product> page = includeInactive 
            ? repository.findAll(pageable) 
            : repository.findByStatus(ProductStatus.ACTIVE, pageable);
        return page.map(ProductResponse::from);
    }

    @Transactional(readOnly = true)
    public ProductResponse findbyId(Long id, boolean includeInactive) {
        Product product = repository.findById(id)
            .filter(p -> includeInactive || p.getStatus() == ProductStatus.ACTIVE)
            .orElseThrow(() -> notFound(id));

        return ProductResponse.from(product);
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = new Product();
        apply(product, request);
        return ProductResponse.from(repository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = repository.findById(id).orElseThrow(() -> notFound(id));
        apply(product, request);
        return ProductResponse.from(product);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(repository.findById(id).orElseThrow(() -> notFound(id)));
    }

    private void apply(Product product, ProductRequest request) {
        product.setDescription(request.description().trim());
        product.setDetail(blankToNull(request.detail()));
        product.setPrice(request.price());
        product.setStock(request.stock());
        product.setStatus(request.status());
        product.setImageUrl(blankToNull(request.imageUrl()));
        product.setBrand(brandService.getEntity(request.brandId()));
        product.setCategory(categoryService.getEntity(request.categoryId()));
        product.setPetType(petTypeService.getEntity(request.petTypeId()));
        product.setProvider(providerService.getEntity(request.providerId()));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private ResourceNotFoundException notFound(Long id) {
        return new ResourceNotFoundException("Producto con id " + id + " no encontrado");
    }
}
