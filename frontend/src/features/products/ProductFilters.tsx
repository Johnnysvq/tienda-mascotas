import { useState } from "react";
import { useCatalogFilters } from "./catalogFilters";
import { SelectField } from "../../components/SelectField";
import { toSelectOptions, useOptions } from "./options";

export function ProductFilters() {
  const { filters, update, clearFilters, hasActiveFilters } =
    useCatalogFilters();
  const [open, setOpen] = useState(false); // solo afecta a pantallas pequeñas
  const brands = useOptions("brands");
  const categories = useOptions("categories");
  const petTypes = useOptions("pet-types");

  const activeCount = [
    filters.brandId,
    filters.categoryId,
    filters.petTypeId,
  ].filter(Boolean).length;

  return (
    <div className="rounded-xl border border-slate-200 bg-formBg p-4 shadow-md">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="filters-panel"
        className="flex w-full cursor-pointer items-center justify-between text-left lg:hidden"
      >
        <span className="font-semibold text-stone-900">
          Filtros{activeCount > 0 ? ` (${activeCount})` : ""}
        </span>
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>

      <h2 className="hidden font-semibold text-stone-900 lg:block">Filtros</h2>

      <div
        id="filters-panel"
        className={`mt-4 space-y-4 ${open ? "block" : "hidden"} lg:block`}
      >
        {filters.q && (
          <p className="text-sm text-stone-600">
            Búsqueda:{" "}
            <span className="font-medium text-stone-900">“{filters.q}”</span>
          </p>
        )}

        <SelectField
          id="filter-brand"
          label="Marca"
          placeholder="Todas las marcas"
          value={filters.brandId}
          options={toSelectOptions(brands.data?.content)}
          onValueChange={(brand) => update({ brand })}
        />
        <SelectField
          id="filter-category"
          label="Categoría"
          placeholder="Todas las categorías"
          value={filters.categoryId}
          options={toSelectOptions(categories.data?.content)}
          onValueChange={(category) => update({ category })}
        />
        <SelectField
          id="filter-pet-type"
          label="Tipo de mascota"
          placeholder="Todos los tipos"
          value={filters.petTypeId}
          options={toSelectOptions(petTypes.data?.content)}
          onValueChange={(petType) => update({ petType })}
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="cursor-pointer text-sm font-semibold text-aqua hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
