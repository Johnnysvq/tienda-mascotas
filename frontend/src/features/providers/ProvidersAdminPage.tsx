import { useState } from "react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { Pagination } from "../../components/Pagination";
import { errorMessage } from "../../lib/errors";
import { formatDateTime } from "../../lib/format";
import { useDeleteProvider, useProviders, type Provider } from "./api";
import { ProviderForm } from "./ProviderForm";
import { deleteBtnClass, editBtnClass } from "../../lib/buttonStyles";
import { Edit2, Trash2 } from 'reicon-react';

export default function ProvidersAdminPage() {
  const [page, setPage] = useState(0)
  const [editing, setEditing] = useState<Provider | null>(null)
  const [toDelete, setToDelete] = useState<Provider | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data, isPending, isError, isPlaceholderData } = useProviders(page)
  const remove = useDeleteProvider()

  function confirmDelete() {
    if (!toDelete) return
    const wasLastOnPage = data?.content.length === 1 && page > 0
    const deletedId = toDelete.id

    remove.mutate(deletedId, {
        onSuccess: () => {
            setToDelete(null)
            if (wasLastOnPage) setPage((p) => p - 1)
            if (editing?.id === deletedId) setEditing(null)  
        },
        onError: (error) => {
            setToDelete(null)
            setDeleteError(errorMessage(error))
        },
    })
  }

  return (
    <section className="space-y-6">

        <ProviderForm
            key={editing?.id ?? 'new'}
            provider={editing}
            onDone={() => setEditing(null)}
        />

        {deleteError && (
            <p role="alert" className="rounded-md border border-red-50 bg-red-50 p-3 text-sm text-red-700">
                {deleteError}
            </p>
        )}
        {isPending && <p className="text-slate-500">Cargando proveedores...</p>}
        {isError && (
            <p role="alert" className="text-red-600">
                No se pudo cargar la lista de proveedores.
            </p>
        )}

        {data && data.content.length === 0 && <p className="text-slate-500">Aún no hay proveedores.</p>}

        {data && data.content.length > 0 && (
            <>
                <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
                    <table className={`w-full text-left text-sm ${isPlaceholderData ? 'opacity-60' : ''}`}>
                        <thead className="border-b border-slate-200 bg-papaya text-slate-700">
                            <tr>
                                <td scope="col" className="px-4 py-3 font-semibold">Nombre</td>
                                <td scope="col" className="px-4 py-3 font-semibold">Correo</td>
                                <td scope="col" className="px-4 py-3 font-semibold">Teléfono</td>
                                <td scope="col" className="px-4 py-3 font-semibold">Alta</td>
                                <td scope="col" className="px-4 py-3 text-right font-semibold">Acciones</td>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-tableBg">
                            {data.content.map((provider) => (
                                <tr key={provider.id}>
                                    <td className="px-4 py-3 font-medium">{provider.name}</td>
                                    <td className="px-4 py-3 font-medium">{provider.email}</td>
                                    <td className="px-4 py-3 font-medium">{provider.phoneNumber ?? '-'}</td>
                                    <td className="whitespace-nowrap px-4 py-3 font-medium">{formatDateTime(provider.createdAt)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                className={editBtnClass}
                                                aria-label={`Editar ${provider.name}`}
                                                onClick={() => {
                                                    setDeleteError(null)
                                                    setEditing(provider)
                                                }}
                                            >
                                                <Edit2 size={24} color="black"/>
                                            </button>
                                            <button
                                            type="button"
                                            className={deleteBtnClass}
                                            aria-label={`Eliminar ${provider.name}`}
                                            onClick={() => {
                                                setDeleteError(null)
                                                setToDelete(provider)
                                            }}
                                            >
                                                <Trash2 size={24} color="black"/>    
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
            title="Eliminar proveedor"
            message={`¿Seguro que quieres eliminar "${toDelete?.name ?? ''}"? Esta acción no se puede deshacer.`}
            confirmLabel="Eliminar"
            pending={remove.isPending}
            onConfirm={confirmDelete}
            onCancel={() => setToDelete(null)}
        />
    </section>
  )
}
