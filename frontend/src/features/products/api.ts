import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, ApiError } from "../../lib/api";
import type { Page } from "../../lib/types";
import { catalogQuery, type CatalogFilters } from "./catalogFilters";

export interface Ref {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  description: string;
  detail: string | null;
  price: number;
  stock: number;
  status: "ACTIVE" | "INACTIVE";
  imageKey: string | null;
  brand: Ref;
  category: Ref;
  petType: Ref;
  providerId: number | null; // Solo lo recibe un administrador
}

export interface ProductInput {
  description: string;
  detail: string | null;
  price: number;
  stock: number;
  status: "ACTIVE" | "INACTIVE";
  imageKey: string | null;
  brandId: number;
  categoryId: number;
  petTypeId: number;
  providerId: number;
}

// Catálogo público (con filtros, búsqueda y orden)
export function useProducts(filters: CatalogFilters) {
  return useQuery({
    queryKey: ["products", "catalog", filters],
    queryFn: ({ signal }) =>
      api<Page<Product>>(`/products?${catalogQuery(filters)}`, { signal }),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

// Tabla del panel (con sesión de administrador incluye los inactivos y el providerId)
export function useAdminProducts(page = 0) {
  return useQuery({
    queryKey: ["products", "admin", page],
    queryFn: ({ signal }) =>
      api<Page<Product>>(`/products?page=${page}&size=20`, { signal }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) =>
      api<Product>("/products", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: ProductInput & { id: number }) =>
      api<Product>(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api<void>(`/products/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["products", "detail", id],
    queryFn: ({ signal }) => api<Product>(`/products/${id}`, { signal }),
    enabled: id !== undefined,
    staleTime: 60_000,
    // Un 404 no se reintenta: el producto no existe o está oculto
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 2,
  });
}
