interface PaginationProps {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
    disabled?: boolean
}

const buttonClass = 
    'rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ' +
    'hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'

export function Pagination({ page, totalPages, onPageChange, disabled = false }: PaginationProps) {
    if (totalPages === 0) return null

    return (
        <nav aria-label="Paginación" className="mt-4 flex items-center justify-between">
            <button
              type="button"
              className={buttonClass}
              onClick={() => onPageChange(page - 1)}
              disabled={disabled || page === 0}
            >
                Anterior
            </button>
            <span className="text-sm text-slate-600">
                Página {page + 1} de {totalPages}
            </span>
            <button
              type="button"
              className={buttonClass}
              onClick={() => onPageChange(page + 1)}
              disabled={disabled || page + 1 >= totalPages}
            >
                Siguiente
            </button>
        </nav>
    )
}