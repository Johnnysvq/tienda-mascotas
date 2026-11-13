import type { SelectHTMLAttributes } from 'react'
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'

export interface SelectOption {
    value: string | number
    label: string
}

interface SelectFieldProps
    extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'name' | 'onChange' | 'onBlur' | 'ref'> {
        id: string
        label: string
        options: SelectOption[]
        placeholder?: string
        error?: FieldError
        registration: UseFormRegisterReturn
}

export function SelectField({
    id,
    label,
    options,
    placeholder,
    error,
    registration,
    ...selectProps
}: SelectFieldProps) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-700">
                {label}
            </label>
            <select
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-papaya focus:outline-hidden focus:ring-1 focus:ring-papaya"
                {...selectProps}
                {...registration}
            >
                {placeholder !== undefined && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={String(option.value)}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-600">
                    {error.message}
                </p>
            )}
        </div>
    )
}