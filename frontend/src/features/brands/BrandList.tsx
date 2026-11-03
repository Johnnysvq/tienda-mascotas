import { useBrands } from './api'

export function BrandList() {
    const { data, isPending, isError } = useBrands()

    if (isPending) return <p className="text-slate-500">Cargando...</p>
    if (isError) {
        return <p role="alert" className="text-red-600">No se pudo cargar la lista de marcas.</p>
    }
    if (data.content.length === 0) {
        return <p className="text-slate-500">Aún no hay marcas.</p>
    }

    return (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {data.content.map((brand) =>(
                <li key={brand.id} className="px-4 py-3">
                    {brand.name}
                </li>
            ))}
        </ul>
    )
}