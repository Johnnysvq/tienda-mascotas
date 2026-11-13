import { useState } from 'react'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Pagination } from '../../components/Pagination'
import { errorMessage } from '../../lib/errors'
import { usePetTypes, useDeletePetType, type PetType } from './api'
import { PetTypeForm } from './PetTypesForm'
import { deleteBtnClass, editBtnClass } from '../../lib/buttonStyles'
import { Edit2, Trash2 } from 'reicon-react';

export default function PetTypesAdminPage() {

    const [page, setPage] = useState(0)
    const [editing, setEditing] = useState<PetType | null>(null)
    const [toDelete, setToDelete] = useState<PetType | null>(null)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    const { data, isPending, isError, isPlaceholderData } = usePetTypes(page)
    const remove = useDeletePetType()

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

        return (
            <section className="space-y-6">
    
                <PetTypeForm key={editing?.id ?? 'new'} petType={editing} onDone={() => setEditing(null)}/>
    
                {deleteError && (
                    <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {deleteError}
                    </p>
                )}
    
                {isPending && <p className="text-slate-500">Cargando tipos de mascotas...</p>}
                {isError && (
                    <p role="alert" className="text-red-600">
                        No se pudo cargar la lista de tipos de mascotas.
                    </p>
                )}
    
                {data && data.content.length === 0 && <p className="text-slate-500">Aún no hay tipos de mascotas.</p>}
                {data && data.content.length > 0 && (
                    <>
                        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                            <table className={`w-full text-left text-sm ${isPlaceholderData ? 'opacity-60' : ''}`}>
                                <thead className="border-b border-slate-200 bg-papaya text-slate-700">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 font-semibold">Nombre</th>
                                        <th scope="col" className="px-4 py-3 text-right font-semibold">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-tableBg">
                                    {data.content.map((petType) => (
                                        <tr key={petType.id}>
                                            <td className="px-4 py-3 font-medium">{petType.name}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        className={editBtnClass}
                                                        aria-label={`Editar ${petType.name}`}
                                                        onClick={() => {
                                                            setDeleteError(null)
                                                            setEditing(petType)
                                                        }}
                                                    >
                                                        <Edit2 size={24} color="black"/>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={deleteBtnClass}
                                                        aria-label={`Eliminar ${petType.name}`}
                                                        onClick={() => {
                                                            setDeleteError(null)
                                                            setToDelete(petType)
                                                        }}>
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
                    title="Eliminar tipo de mascota"
                    message={`¿Seguro que quieres eliminar "${toDelete?.name ?? ''}"? Esta acción no se puede deshacer.`}
                    confirmLabel="Eliminar"
                    pending={remove.isPending}
                    onConfirm={confirmDelete}
                    onCancel={() => setToDelete(null)}
                />
            </section>
        )
}