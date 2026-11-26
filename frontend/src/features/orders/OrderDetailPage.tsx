import { useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { NotFound } from "../../components/NotFound";
import { ApiError } from "../../lib/api";
import { formatDateTime, formatPrice } from "../../lib/format";
import { usePageTitle } from "../../lib/usePageTitle";
import { useCancelOrder, useOrder } from "./api";
import { PAYMENT_LABEL, STATUS_CLASS, STATUS_LABEL } from "./orderLabels";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { errorMessage } from "../../lib/errors";
import { OrderTimeline } from "./OrderTimeline";

const ID_PATTERN = /^\d{1,18}$/;

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const validId = id !== undefined && ID_PATTERN.test(id) ? id : undefined;
  const { data: order, isPending, isError, error } = useOrder(validId);
  const cancel = useCancelOrder();
  const [confirmCancel, setConfirmCancel] = useState(false);
  usePageTitle(order ? `Pedido #${order.id}` : undefined);

  const placed =
    (location.state as { placed?: boolean } | null)?.placed === true;

  if (validId === undefined) return <NotFound title="Pedido no encontrado" />;
  if (isPending)
    return (
      <p className="page-container py-6 text-slate-500">Cargando pedido…</p>
    );
  if (isError) {
    if (error instanceof ApiError && error.status === 404)
      return <NotFound title="Pedido no encontrado" />;
    return (
      <p role="alert" className="page-container py-6 text-red-600">
        No se pudo cargar el pedido.
      </p>
    );
  }

  return (
    <main className="page-container py-6 text-stone-900">
      <Link
        to="/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
      >
        <span aria-hidden="true">←</span> Mis pedidos
      </Link>

      {placed && (
        <div
          role="status"
          className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-900"
        >
          <p className="font-semibold">¡Pedido recibido!</p>
          <p className="mt-1 text-sm">
            Guarda el número <strong>#{order.id}</strong>.{" "}
            {order.paymentMethod === "CASH_ON_DELIVERY"
              ? "Pagarás al recibir tu pedido."
              : "Nos pondremos en contacto contigo para coordinar el pago por SINPE Móvil."}
          </p>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Pedido #{order.id}</h1>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_CLASS[order.status]}`}
        >
          {STATUS_LABEL[order.status]}
        </span>
        <span className="text-sm text-stone-600">
          {formatDateTime(order.createdAt)}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <section
          aria-label="Productos del pedido"
          className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-papaya text-slate-700">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Producto
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Precio
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Cant.
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-tableBg">
              {order.items.map((line) => (
                <tr key={line.productId}>
                  <td className="px-4 py-3">
                    <Link
                      to={`/products/${line.productId}`}
                      className="font-medium hover:underline"
                    >
                      {line.description}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {formatPrice(line.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-right">{line.quantity}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-medium">
                    {formatPrice(line.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-tableBg">
              <tr className="border-t border-slate-200">
                <th
                  scope="row"
                  colSpan={3}
                  className="px-4 py-3 text-right font-semibold"
                >
                  Total
                </th>
                <td className="whitespace-nowrap px-4 py-3 text-right text-lg font-bold">
                  {formatPrice(order.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        <aside
          aria-label="Datos de entrega"
          className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
        >
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
          <section
            aria-label="Historial"
            className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h2 className="text-lg font-semibold">Seguimiento</h2>
            <OrderTimeline
              createdAt={order.createdAt}
              history={order.history}
            />
          </section>

          {order.status === "PENDING" && (
            <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <p className="text-stone-600">
                Puedes cancelar tu pedido mientras siga pendiente.
              </p>
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="cursor-pointer rounded-md border border-red-300 bg-red-50 px-3 py-1.5 font-medium text-red-700 hover:bg-red-100"
              >
                Cancelar pedido
              </button>
              {cancel.isError && (
                <p role="alert" className="text-red-600">
                  {errorMessage(cancel.error)}
                </p>
              )}
            </section>
          )}
        </aside>
      </div>
      <ConfirmDialog
        open={confirmCancel}
        title="Cancelar pedido"
        message={`¿Seguro que quieres cancelar el pedido #${order.id}? No se puede deshacer.`}
        confirmLabel="Cancelar pedido"
        pending={cancel.isPending}
        onConfirm={() =>
          cancel.mutate(order.id, { onSettled: () => setConfirmCancel(false) })
        }
        onCancel={() => setConfirmCancel(false)}
      />
    </main>
  );
}
