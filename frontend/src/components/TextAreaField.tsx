import type { TextareaHTMLAttributes } from 'react'
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'

interface TextAreaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name' | 'onChange' | 'onBlur' | 'ref'> {
  id: string
  label: string
  error?: FieldError
  hint?: string
  registration: UseFormRegisterReturn
}

export function TextAreaField({ id, label, error, hint, registration, ...textareaProps }: TextAreaFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-700 focus:outline-hidden focus:ring-1 focus:ring-brand-700"
        {...textareaProps}
        {...registration}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-stone-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-600">
          {error.message}
        </p>
      )}
    </div>
  )
}