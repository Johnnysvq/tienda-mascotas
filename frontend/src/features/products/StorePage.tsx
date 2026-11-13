import { ProductList } from './ProductList'

export function StorePage() {
  return (
    <main className="mx-auto max-w-6xl p-6 text-stone-900">
      <h1 className="mb-4 text-2xl font-bold">Catálogo</h1>
      <ProductList />
    </main>
  )
}