import type { InputHTMLAttributes } from 'react'
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'

interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'onChange' | 'onBlur' | 'ref'> {
  id: string
  label: string
  error?: FieldError
  registration: UseFormRegisterReturn
  sanitize?: (value: string) => string // limpia lo que se escribe o se pega
}

export function TextField({ id, label, error, registration, sanitize, ...inputProps }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-papaya focus:outline-hidden focus:ring-1 focus:ring-papaya"
        {...inputProps}
        {...registration}
        onChange={(event) => {
          if (sanitize) {
            const input = event.target
            const cleaned = sanitize(input.value)
            if (cleaned !== input.value) {
              const cursor = input.selectionStart
              const removed = input.value.length - cleaned.length
              input.value = cleaned
              if (cursor !== null) {
                const position = Math.max(0, cursor - removed)
                input.setSelectionRange(position, position)
              }
            }
          }
          return registration.onChange(event)
        }}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-600">
          {error.message}
        </p>
      )}
    </div>
  )
}