import { BrandList } from './features/brands/BrandList'

export default function App() {
  return (
    <main className="mx-auto max-w-2x1 p-6">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Marcas</h1>
      <BrandList />
    </main>
  )
}