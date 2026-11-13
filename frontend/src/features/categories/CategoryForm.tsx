import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ApiError } from "../../lib/api"
import { errorMessage } from "../../lib/errors"
import { useCreateCategory, useUpdateCategory, type Category } from "./api"
import { categorySchema, type CategoryFormValues} from './categorySchema'
import { saveBtnClass, cancelBtnClass } from "../../lib/buttonStyles"

interface CategoryFormProps {
    category: Category | null
    onDone: () => void
}

export function CategoryForm({ category, onDone }: CategoryFormProps) {
    const create = useCreateCategory()
    const update = useUpdateCategory()

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors },
    } = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {name: category?.name ?? ''}
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

    function onSubmit(values: CategoryFormValues) {
        const options = {
            onSuccess: () => {
                reset({ name: '' })
                onDone()
            },
            onError: handleServerError,
        }
        if (category) update.mutate({ id: category.id, ...values}, options)
        else create.mutate(values, options)
    }

    const generalError = failure && !errors.name ? errorMessage(failure): null

    return (
        <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="rounded-lg border border-slate-200 bg-formBg p-4 shadow-md"
        >
            <h2 className="mb-3 text-lg font-semibold">{category ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
            <label htmlFor="category-name" className="block text-sm font-medium text-slate-700">
                Nombre
            </label>
            <input
                id="category-name"
                type="text"
                autoComplete="off"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? 'category-name-error' : undefined}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-papaya focus:outline-hidden focus:ring-1 focus:ring-papaya"
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
                    className={saveBtnClass}
                >
                    {pending ? 'Guardando...' : category ? 'Guardar cambios' : 'Crear categoría'}
                </button>
                {category && (
                    <button
                        type="button"
                        onClick={onDone}
                        className={cancelBtnClass}
                        >
                            Cancelar
                    </button>
                )}
            </div>
        </form>
    )
}