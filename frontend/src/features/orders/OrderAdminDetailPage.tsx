import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { NotFound } from '../../components/NotFound'
import { ApiError } from '../../lib/api'
import { errorMessage } from '../../lib/errors'
import { formatDateTime, formatPrice } from '../../lib/format'
import { usePageTitle } from '../../lib/usePageTitle'
import type { OrderStatus } from './api'
import { useAdminOrder, useChangeOrderStatus } from './adminApi'
import { ACTION_LABEL, NEXT_STATUSES, PAYMENT_LABEL, STATUS_CLASS, STATUS_LABEL } from './orderLabels'
import { OrderTimeline } from './OrderTimeline'

const ID_PATTERN = /^\d{1,18}$/

export default function OrderAdminDetailPage() {
  const { id } = useParams()
  const validId = id !== undefined && ID_PATTERN.test(id) ? id : undefined
  const { data: order, isPending, isError, error } = useAdminOrder(validId)
  const change = useChangeOrderStatus()
  const [confirmCancel, setConfirmCancel] = useState(false)
  usePageTitle(order ? `Pedido #${order.id}` : undefined)

  if (validId === undefined) return <NotFound title="Pedido no encontrado" />
  if (isPending) return <p className="text-slate-500">Cargando pedido…</p>
  if (isError) {
    if (error instanceof ApiError && error.status === 404) return <NotFound title="Pedido no encontrado" />
    return (
      <p role="alert" className="text-red-600">
        No se pudo cargar el pedido.
      </p>
    )
  }

  const next = NEXT_STATUSES[order.status]

  function apply(status: OrderStatus) {
    change.mutate({ id: order!.id, status }, { onSettled: () => setConfirmCancel(false) })
  }

  return (
    <section className="space-y-6">
      <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        <span aria-hidden="true">←</span> Pedidos
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Pedido #{order.id}</h1>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_CLASS[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
        <span className="text-sm text-stone-600">{formatDateTime(order.createdAt)}</span>
      </div>

      {change.isError && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage(change.error)}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-papaya text-slate-700">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Producto</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Precio</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Cant.</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-tableBg">
                {order.items.map((line) => (
                  <tr key={line.productId}>
                    <td className="px-4 py-3 font-medium">{line.description}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">{formatPrice(line.unitPrice)}</td>
                    <td className="px-4 py-3 text-right">{line.quantity}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium">{formatPrice(line.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-tableBg">
                <tr className="border-t border-slate-200">
                  <th scope="row" colSpan={3} className="px-4 py-3 text-right font-semibold">Total</th>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-lg font-bold">{formatPrice(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <section aria-label="Historial" className="rounded-xl border border-slate-200 bg-tableBg p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Historial</h2>
            <OrderTimeline createdAt={order.createdAt} history={order.history} showActor />
          </section>
        </div>

        <aside className="space-y-4">
          <section aria-label="Acciones" className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Acciones</h2>
            {next.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {next.map((status) =>
                  status === 'CANCELLED' ? (
                    <button
                      key={status}
                      type="button"
                      disabled={change.isPending}
                      onClick={() => setConfirmCancel(true)}
                      className="cursor-pointer rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
                    >
                      {ACTION_LABEL[status]}
                    </button>
                  ) : (
                    <button
                      key={status}
                      type="button"
                      disabled={change.isPending}
                      onClick={() => apply(status)}
                      className="cursor-pointer rounded-md bg-brand-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60"
                    >
                      {change.isPending ? 'Guardando…' : ACTION_LABEL[status]}
                    </button>
                  ),
                )}
              </div>
            ) : (
              <p className="text-sm text-stone-600">
                Este pedido está {STATUS_LABEL[order.status].toLowerCase()} y no admite más cambios.
              </p>
            )}
          </section>

          <section aria-label="Cliente" className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
            <h2 className="text-lg font-semibold">Cliente</h2>
            {order.customer && (
              <p>
                {order.customer.name}
                <span className="block text-stone-500">{order.customer.email}</span>
              </p>
            )}
          </section>

          <section aria-label="Entrega" className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
            <h2 className="text-lg font-semibold">Entrega</h2>
            <p>
              <span className="block text-stone-500">Recibe</span>
              {order.recipientName}
            </p>
            <p>
              <span className="block text-stone-500">Teléfono</span>
              {order.phoneNumber}
            </p>
            <p>
              <span className="block text-stone-500">Dirección</span>
              <span className="whitespace-pre-line">{order.address}</span>
            </p>
            {order.notes && (
              <p>
                <span className="block text-stone-500">Notas</span>
                <span className="whitespace-pre-line">{order.notes}</span>
              </p>
            )}
            <p>
              <span className="block text-stone-500">Pago</span>
              {PAYMENT_LABEL[order.paymentMethod]}
            </p>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancelar pedido"
        message={`Se cancelará el pedido #${order.id} y se devolverá el stock de sus productos. No se puede deshacer.`}
        confirmLabel="Cancelar pedido"
        pending={change.isPending}
        onConfirm={() => apply('CANCELLED')}
        onCancel={() => setConfirmCancel(false)}
      />
    </section>
  )
}