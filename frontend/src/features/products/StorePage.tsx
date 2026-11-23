import { ProductFilters } from './ProductFilters'
import { ProductList } from './ProductList'

export function StorePage() {
  return (
    <main className="page-container py-6 text-stone-900">
      <h1 className="mb-6 text-2xl font-bold">Catálogo</h1>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr] lg:items-start">
        <aside aria-label="Filtros del catálogo" className="lg:sticky lg:top-24">
          <ProductFilters />
        </aside>

        <section aria-label="Productos" className="min-w-0">
          <ProductList />
        </section>
      </div>
    </main>
  )
}