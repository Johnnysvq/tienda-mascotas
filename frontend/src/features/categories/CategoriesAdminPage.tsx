import { useState } from 'react'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Pagination } from '../../components/Pagination'
import { errorMessage } from '../../lib/errors'
import { useCategories, useDeleteCategory, type Category } from './api'
import { CategoryForm } from './CategoryForm'

export default function CategoriesAdminPage() {
    const [page, setPage] = useState(0)
    const [editing, setEditing] = useState<Category | null>(null)
    const [toDelete, setToDelete] = useState<Category | null>(null)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    const { data, isPending, isError, isPlaceholderData } = useCategories(page)
    const remove = useDeleteCategory()

    function confirmDelete() {
        if (!toDelete) return
        const wasLastOnPage = data?.content.length === 1 && page > 0
        const deleteId = toDelete.id

        remove.mutate(deleteId, {
            onSuccess: () => {
                setToDelete(null)
                if (wasLastOnPage) setPage((p) => p - 1)
                if (editing?.id === deleteId) setEditing(null)
            },
            onError: (error) => {
                setToDelete(null)
                setDeleteError(errorMessage(error))
            },
        })
    }

    const actionClass = 
        'rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50'

    return (
        <section className="space-y-6">
            <h1 className="text-2xl font-bold">Categorías</h1>

            <CategoryForm key={editing?.id ?? 'new'} category={editing} onDone={() => setEditing(null)}/>

            {deleteError && (
                <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {deleteError}
                </p>
            )}

            {isPending && <p className="text-slate-500">Cargando categorías...</p>}
            {isError && (
                <p role="alert" className="text-red-600">
                    No se pudo cargar la lista de categorías.
                </p>
            )}

            {data && data.content.length === 0 && <p className="text-slate-500">Aún no hay categorías.</p>}
            {data && data.content.length > 0 && (
                <>
                    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                        <table className={`w-full text-left text-sm ${isPlaceholderData ? 'opacity-60' : ''}`}>
                            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                                <tr>
                                    <th scope="col" className="px-4 py-3 font-medium">Nombre</th>
                                    <th scope="col" className="px-4 py-3 text-right font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {data.content.map((category) => (
                                    <tr key={category.id}>
                                        <td className="px-4 py-3">{category.name}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    className={actionClass}
                                                    aria-label={`Editar ${category.name}`}
                                                    onClick={() => {
                                                        setDeleteError(null)
                                                        setEditing(category)
                                                    }}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className={actionClass}
                                                    aria-label={`Eliminar ${category.name}`}
                                                    onClick={() => {
                                                        setDeleteError(null)
                                                        setToDelete(category)
                                                    }}>
                                                        Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        page={data.page.number}
                        totalPages={data.page.totalPages}
                        onPageChange={setPage}
                        disabled={isPlaceholderData}
                    />
                </>
            )}

            <ConfirmDialog
                open={toDelete !== null}
                title="Eliminar categoría"
                message={`¿Seguro que quieres eliminar "${toDelete?.name ?? ''}"? Esta acción no se puede deshacer.`}
                confirmLabel="Eliminar"
                pending={remove.isPending}
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)}
            />
        </section>
    )
}