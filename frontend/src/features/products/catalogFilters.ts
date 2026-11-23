import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

export const SORT_OPTIONS = [
  { key: "name", label: "Nombre (A-Z)", sort: ["description,asc", "id,asc"] },
  {
    key: "price-asc",
    label: "Precio: menor a mayor",
    sort: ["price,asc", "id,asc"],
  },
  {
    key: "price-desc",
    label: "Precio: mayor a menor",
    sort: ["price,desc", "id,asc"],
  },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["key"];
export const DEFAULT_SORT: SortKey = "name";

export interface CatalogFilters {
  page: number; // base 0 (en la URL se muestra en base 1)
  q: string;
  brandId: string;
  categoryId: string;
  petTypeId: string;
  sort: SortKey;
}

type FilterChanges = Partial<
  Record<"q" | "brand" | "category" | "petType" | "sort" | "page", string>
>;

const ID_PATTERN = /^\d{1,18}$/;

function readId(value: string | null): string {
  return value && ID_PATTERN.test(value) ? value : "";
}

export function useCatalogFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<CatalogFilters>(() => {
    const rawPage = Number(params.get("page"));
    return {
      page:
        Number.isInteger(rawPage) && rawPage >= 1 && rawPage <= 100_000
          ? rawPage - 1
          : 0,
      q: (params.get("q") ?? "").trim().slice(0, 100),
      brandId: readId(params.get("brand")),
      categoryId: readId(params.get("category")),
      petTypeId: readId(params.get("petType")),
      sort:
        SORT_OPTIONS.find((option) => option.key === params.get("sort"))?.key ??
        DEFAULT_SORT,
    };
  }, [params]);

  // Cualquier cambio de filtro vuelve a la primera página, salvo que el cambio sea de página
  const update = useCallback(
    (changes: FilterChanges, replace = false) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(changes)) {
            if (value) next.set(key, value);
            else next.delete(key);
          }
          if (!("page" in changes)) next.delete("page");
          return next;
        },
        { replace },
      );
    },
    [setParams],
  );

  const setPage = useCallback(
    (page: number) => update({ page: page > 0 ? String(page + 1) : "" }),
    [update],
  );

  const clearFilters = useCallback(
    () => setParams(new URLSearchParams()),
    [setParams],
  );

  const hasActiveFilters = Boolean(
    filters.q || filters.brandId || filters.categoryId || filters.petTypeId,
  );

  return { filters, update, setPage, clearFilters, hasActiveFilters };
}

export function catalogQuery(filters: CatalogFilters, size = 12): string {
  const params = new URLSearchParams({
    page: String(filters.page),
    size: String(size),
  });
  if (filters.q) params.set("q", filters.q);
  if (filters.brandId) params.set("brandId", filters.brandId);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.petTypeId) params.set("petTypeId", filters.petTypeId);

  // El segundo criterio (id) desempata y evita que un producto salte entre páginas
  const option = SORT_OPTIONS.find((o) => o.key === filters.sort);
  for (const value of option?.sort ?? []) params.append("sort", value);

  return params.toString();
}
