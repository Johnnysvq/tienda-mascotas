import { useState } from 'react'
import { Link } from 'react-router'
import { Pagination } from '../../components/Pagination'
import { SelectField } from '../../components/SelectField'
import { formatDateTime, formatPrice } from '../../lib/format'
import { usePageTitle } from '../../lib/usePageTitle'
import type { OrderStatus } from './api'
import { useAdminOrders } from './adminApi'
import { STATUS_CLASS, STATUS_LABEL } from './orderLabels'


const statusOptions = (Object.keys(STATUS_LABEL) as OrderStatus[]).map((status) => ({
  value: status,
  label: STATUS_LABEL[status],
}))

export default function OrdersAdminPage() {
  usePageTitle('Pedidos')
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const { data, isPending, isError, isPlaceholderData } = useAdminOrders(page, status)

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Pedidos</h1>

      <div className="max-w-xs">
        <SelectField
          id="orders-status"
          label="Filtrar por estado"
          placeholder="Todos"
          value={status}
          options={statusOptions}
          onValueChange={(value) => {
            setStatus(value as OrderStatus | '')
            setPage(0)
          }}
        />
      </div>

      {isPending && <p className="text-slate-500">Cargando pedidos…</p>}
      {isError && (
        <p role="alert" className="text-red-600">
          No se pudieron cargar los pedidos.
        </p>
      )}

      {data && data.content.length === 0 && <p className="text-slate-500">No hay pedidos con ese filtro.</p>}

      {data && data.content.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className={`w-full text-left text-sm ${isPlaceholderData ? 'opacity-60' : ''}`}>
              <thead className="border-b border-slate-200 bg-papaya text-slate-700">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Pedido</th>
                  <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
                  <th scope="col" className="px-4 py-3 font-medium">Cliente</th>
                  <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-tableBg">
                {data.content.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-medium">#{order.id}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatDateTime(order.createdAt)}</td>
                    <td className="px-4 py-3">{order.customerName}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        aria-label={`Ver el pedido ${order.id}`}
                        className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={data.page.number}
            totalPages={data.page.totalPages}
            onPageChange={setPage}
            disabled={isPlaceholderData}
          />
        </>
      )}
    </section>
  )
}