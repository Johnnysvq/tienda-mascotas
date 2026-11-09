import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
    open: boolean
    title: string
    message: string
    confirmLabel: string
    pending?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel,
    pending = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const ref = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialog = ref.current
        if (!dialog) return
        if (open && !dialog.open) dialog.showModal()
        if (!open && dialog.open) dialog.close()
    }, [open])

    return (
        <dialog
          ref={ref}
          onCancel={(event) => {
              event.preventDefault()
              onCancel()
          }}
          className="m-auto w-full max-w-sm rounded-l-lg border border-slate-200 p-6 backdrop:bg-slate-900/50"
        >
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
            <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                    Cancelar
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={pending}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                >
                    {pending ? 'Eliminando...' : confirmLabel}
                </button>
            </div>
        </dialog>
    )
}