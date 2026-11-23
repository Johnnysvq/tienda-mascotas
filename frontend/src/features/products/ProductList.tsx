import { Pagination } from '../../components/Pagination'
import { useProducts } from './api'
import { DEFAULT_SORT, SORT_OPTIONS, useCatalogFilters } from './catalogFilters'
import { ProductCard } from './ProductCard'

function SortSelect() {
  const { filters, update } = useCatalogFilters()

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="catalog-sort" className="text-sm text-stone-600">
        Ordenar por
      </label>
      <select
        id="catalog-sort"
        value={filters.sort}
        onChange={(e) => update({ sort: e.target.value === DEFAULT_SORT ? '' : e.target.value })}
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-papaya focus:outline-hidden focus:ring-1 focus:ring-papaya"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function ProductList() {
  const { filters, hasActiveFilters, setPage, clearFilters } = useCatalogFilters()
  const { data, isPending, isError, isPlaceholderData } = useProducts(filters)

  if (isPending) return <p className="text-slate-500">Cargando productos…</p>
  if (isError) {
    return (
      <p role="alert" className="text-red-600">
        No se pudo cargar el catálogo.
      </p>
    )
  }

  if (data.content.length === 0) {
    const filtered = hasActiveFilters || filters.page > 0
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-slate-700">
          {filtered ? 'No hay productos que coincidan con tu búsqueda.' : 'No hay productos disponibles.'}
        </p>
        {filtered && (
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 cursor-pointer text-sm font-medium text-brand-700 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    )
  }

  const { number, totalPages, totalElements } = data.page

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-aqua  " aria-live="polite">
          {totalElements} {totalElements === 1 ? 'producto' : 'productos'}
        </p>
        <SortSelect />
      </div>

      <ul
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 ${
          isPlaceholderData ? 'opacity-60' : ''
        }`}
      >
        {data.content.map((product, index) => (
          <li key={product.id} className="flex">
            <ProductCard product={product} priority={index < 3} />
          </li>
        ))}
      </ul>

      <Pagination
        page={number}
        totalPages={totalPages}
        onPageChange={(page) => {
          setPage(page)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        disabled={isPlaceholderData}
      />
    </>
  )
}