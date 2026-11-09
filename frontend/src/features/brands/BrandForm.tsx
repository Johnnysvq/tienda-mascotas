import { zodResolver } from "@hookform/resolvers/zod"
import {useForm } from "react-hook-form"
import { ApiError } from "../../lib/api"
import { errorMessage } from "../../lib/errors"
import { useCreateBrand, useUpdateBrand, type Brand } from "./api"
import { brandSchema, type BrandFormValues } from "./brandSchema"

interface BrandFormProps {
    brand: Brand | null
    onDone: () => void
}

export function BrandForm({ brand, onDone }: BrandFormProps) {
    const create = useCreateBrand()
    const update = useUpdateBrand()

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors },    
    } = useForm<BrandFormValues>({
        resolver: zodResolver(brandSchema),
        defaultValues: {name: brand?.name ?? ''},
    })

    const pending = create.isPending || update.isPending
    const failure = create.error ?? update.error

    function handleServerError(error:unknown) {
        if (error instanceof ApiError && error.status === 409) {
            setError('name', { message: error.message })
        } else if (error instanceof ApiError && error.status === 400 && error.errors?.name) {
            setError('name', { message: error.errors.name })
        }
    }

    function onSubmit(values: BrandFormValues) {
        const options = {
            onSuccess: () => {
                reset({ name: '' })
                onDone()
            },
            onError: handleServerError,
        }
        if (brand) update.mutate({ id: brand.id, ...values }, options)
        else create.mutate(values, options)
    }

    const generalError = failure && !errors.name ? errorMessage(failure): null

    return (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
            <h2 className="mb-3 text-lg font-semibold">{brand ? 'Editar Marca' : 'Nueva Marca'}</h2>

            <label htmlFor="brand-name" className="block text-sm font-medium text-slate-700">
                Nombre
            </label>
            <input
                id="brand-name"
                type="text"
                autoComplete="off"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? 'brand-name-error' : undefined}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-slate-500"
                {...register('name')}
            />
            {errors.name && (
                <p id="brand-name-error" role="alert" className="mt-1 text-sm text-red-600">
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
                    {pending ? 'Guardando...' : brand ? 'Guardar cambios' : 'Crear marca'}
                </button>
                {brand && (
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