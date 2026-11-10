import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ApiError } from "../../lib/api"
import { errorMessage } from "../../lib/errors"
import { useCreatePetType, useUpdatePetType, type PetType } from "./api"
import { petTypeSchema, type PetTypeFormValues} from './petTypeSchema'

interface PetTypeFormProps {
    petType: PetType | null
    onDone: () => void
}

export function PetTypeForm({ petType, onDone }: PetTypeFormProps) {
    
    const create = useCreatePetType()
    const update = useUpdatePetType()

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors },
    } = useForm<PetTypeFormValues>({
        resolver: zodResolver(petTypeSchema),
        defaultValues: {name: petType?.name ?? ''}
    })

    const pending = create.isPending || update.isPending
    const failure = create.error ?? update.error

    function handleServerError(error:unknown) {
        if (error instanceof ApiError && error.status === 409) {
            setError('name', { message: error.message })
        } else if (error instanceof ApiError && error.status === 400 && error.errors?.name) {
            setError('name', { message: error.errors.name})
        }
    }

    function onSubmit(values: PetTypeFormValues) {
        const options = {
            onSuccess: () => {
                reset({ name: '' })
                onDone()
            },
            onError: handleServerError,
        }
        if (petType) update.mutate({ id: petType.id, ...values}, options)
        else create.mutate(values, options)
    }

    const generalError = failure && !errors.name ? errorMessage(failure): null

    return (
        <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="rounded-lg border border-slate-200 bg-white p-4"
        >
            <h2 className="mb-3 text-lg font-semibold">{petType ? 'Editar Tipo Mascota' : 'Nuevo Tipo Mascota'}</h2>
            <label htmlFor="category-name" className="block text-sm font-medium text-slate-700">
                Nombre
            </label>
            <input
                id="category-name"
                type="text"
                autoComplete="off"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? 'category-name-error' : undefined}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-slate-500"
                {...register('name')}
            />
            {errors.name && (
                <p id="category-name-error" role="alert" className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                </p>
            )}
            {generalError && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                    {generalError}
                </p>
            )}

            <div className="mt-4 flex gap-2">
                <button
                    type="submit"
                    disabled={pending}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                >
                    {pending ? 'Guardando...' : petType ? 'Guardar cambios' : 'Crear tipo mascota'}
                </button>
                {petType && (
                    <button
                        type="button"
                        onClick={onDone}
                        className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancelar
                    </button>
                )}
            </div>
        </form>
    )
}