import { useState } from 'react'
import { Link } from 'react-router'
import { Pagination } from '../../components/Pagination'
import { formatDateTime, formatPrice } from '../../lib/format'
import { usePageTitle } from '../../lib/usePageTitle'
import { useOrders } from './api'
import { STATUS_CLASS, STATUS_LABEL } from './orderLabels'

export default function MyOrdersPage() {
  usePageTitle('Mis pedidos')
  const [page, setPage] = useState(0)
  const { data, isPending, isError, isPlaceholderData } = useOrders(page)

  return (
    <main className="page-container py-6 text-stone-900">
      <h1 className="mb-6 text-2xl font-bold">Mis pedidos</h1>

      {isPending && <p className="text-slate-500">Cargando pedidos…</p>}
      {isError && (
        <p role="alert" className="text-red-600">
          No se pudieron cargar tus pedidos.
        </p>
      )}

      {data && data.content.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-700">Aún no has hecho ningún pedido.</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-full bg-brand-700 px-6 py-2 text-sm font-medium text-white hover:bg-brand-800"
          >
            Ir a la tienda
          </Link>
        </div>
      )}

      {data && data.content.length > 0 && (
        <>
          <ul
            className={`divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm ${
              isPlaceholderData ? 'opacity-60' : ''
            }`}
          >
            {data.content.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/orders/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-semibold">Pedido #{order.id}</p>
                    <p className="text-sm text-stone-600">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASS[order.status]}`}>
                    {STATUS_LABEL[order.status]}
                  </span>
                  <p className="font-semibold">{formatPrice(order.total)}</p>
                </Link>
              </li>
            ))}
          </ul>

          <Pagination
            page={data.page.number}
            totalPages={data.page.totalPages}
            onPageChange={setPage}
            disabled={isPlaceholderData}
          />
        </>
      )}
    </main>
  )
}