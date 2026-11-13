import { useEffect, useId, useRef } from 'react'
import { Loader, Trash2, Xmark } from 'reicon-react'
import { cancelBtnClass, deleteBtnClass } from '../lib/buttonStyles'

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
  const titleId = useId()
  const messageId = useId()

  // showModal() da foco atrapado, cierre con Esc y fondo bloqueado de forma nativa
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      className="mx-auto mb-auto mt-16 w-[calc(100%-2rem)] max-w-lg rounded-xl border border-slate-200 bg-white p-4 shadow-xl backdrop:bg-slate-900/50 motion-safe:open:animate-dialog-in"
    >
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-base font-bold text-slate-900">
            {title}
          </h2>
          <p id={messageId} className="mt-0.5 text-sm text-slate-600">
            {message}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancelar"
            title="Cancelar"
            className={cancelBtnClass}
          >
            <Xmark size={24} color="black" />
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            aria-label={pending ? 'Eliminando' : confirmLabel}
            title={confirmLabel}
            className={deleteBtnClass}
          >
            {pending ? (
              <span className="inline-flex animate-spin">
                <Loader size={24} color="black" />
              </span>
            ) : (
              <Trash2 size={24} color="black" />
            )}
          </button>
        </div>
      </div>
    </dialog>
  )
}