import { ProductList } from "./ProductList"

export function StorePage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-6xl px-6 py-4">
                    <p className="text-xl font-bold">Tienda Mascotas</p>
                </div>
            </header>
            <main className="mx-auto max-w-6xl p-6">
                <h1 className="mb-4 text-2xl font-bold">Catálogo</h1>
                <ProductList />
            </main>
        </div>
    )
}