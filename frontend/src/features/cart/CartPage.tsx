import { useState } from "react";
import { Link } from "react-router";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { formatPrice } from "../../lib/format";
import { productImage } from "../../lib/images";
import { usePageTitle } from "../../lib/usePageTitle";
import { useCurrentUser } from "../auth/api";
import { useCartQuote, type QuoteLine } from "./api";
import { cartActions, MAX_QUANTITY, useCart } from "./cartStore";
import { QuantityStepper } from "./QuantityStepper";

function lineNotice(line: QuoteLine): string | null {
  if (line.status === "LIMITED") {
    const stock = line.availableStock;
    return `Solo ${stock === 1 ? "hay 1 disponible" : `hay ${stock} disponibles`}; ajustamos la cantidad.`;
  }
  if (line.status === "OUT_OF_STOCK") return "Agotado.";
  if (line.status === "UNAVAILABLE")
    return "Este producto ya no está disponible.";
  return null;
}

function CartLine({ line }: { line: QuoteLine }) {
  const thumb = productImage(line.imageKey, 160);
  const name = line.description ?? "Producto no disponible";
  const notice = lineNotice(line);
  const canChange = line.quantity > 0;

  return (
    <li className="flex gap-4 p-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
        {thumb && (
          <img
            src={thumb}
            alt=""
            width={80}
            height={80}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        {line.description ? (
          <Link
            to={`/products/${line.productId}`}
            className="font-medium hover:underline"
          >
            {name}
          </Link>
        ) : (
          <p className="font-medium text-stone-500">{name}</p>
        )}
        {line.unitPrice !== null && (
          <p className="text-sm text-stone-600">
            {formatPrice(line.unitPrice)} c/u
          </p>
        )}
        {notice && (
          <p role="status" className="text-sm font-medium text-amber-700">
            {notice}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          {canChange && (
            <QuantityStepper
              label={`Cantidad de ${name}`}
              value={line.quantity}
              max={Math.min(line.availableStock, MAX_QUANTITY)}
              onChange={(value) =>
                cartActions.setQuantity(line.productId, value)
              }
            />
          )}
          <button
            type="button"
            aria-label={`Quitar ${name}`}
            onClick={() => cartActions.remove(line.productId)}
            className="cursor-pointer text-sm text-red-600 hover:underline"
          >
            Quitar
          </button>
        </div>
      </div>

      {line.subtotal !== null && canChange && (
        <p className="font-semibold">{formatPrice(line.subtotal)}</p>
      )}
    </li>
  );
}

export default function CartPage() {
  usePageTitle("Carrito");
  const { items } = useCart();
  // El precio se pide con un POST: hay que esperar a /auth/me para tener ya la cookie CSRF
  const { isPending: sessionPending } = useCurrentUser();
  const {
    data: quote,
    isPending,
    isError,
    isPlaceholderData,
    refetch,
  } = useCartQuote(items, !sessionPending);
  const [confirmClear, setConfirmClear] = useState(false);

  if (items.length === 0) {
    return (
      <main className="page-container py-12 text-center text-stone-900">
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="mt-2 text-stone-600">
          Agrega productos desde el catálogo para verlos aquí.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-brand-700 px-6 py-2 text-sm font-medium text-white hover:bg-brand-800"
        >
          Ir a la tienda
        </Link>
      </main>
    );
  }

  if (sessionPending || isPending) {
    return (
      <p className="page-container py-6 text-slate-500">Cargando carrito…</p>
    );
  }
  if (isError || !quote) {
    return (
      <main className="page-container py-6">
        <p role="alert" className="text-red-600">
          No se pudo cargar el carrito.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 cursor-pointer text-sm font-medium text-brand-700 hover:underline"
        >
          Reintentar
        </button>
      </main>
    );
  }

  const hasProblems = quote.items.some((line) => line.status !== "OK");

  return (
    <main className="page-container py-6 text-stone-900">
      <h1 className="mb-6 text-2xl font-bold">Carrito</h1>

      {hasProblems && (
        <div
          role="status"
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
        >
          <p>
            Algunos productos cambiaron de disponibilidad desde que los
            agregaste.
          </p>
          <button
            type="button"
            onClick={() => cartActions.reconcile(quote.items)}
            className="cursor-pointer rounded-md border border-amber-300 bg-white px-3 py-1.5 font-medium hover:bg-amber-100"
          >
            Ajustar carrito
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <ul
          className={`divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm ${
            isPlaceholderData ? "opacity-60" : ""
          }`}
        >
          {quote.items.map((line) => (
            <CartLine key={line.productId} line={line} />
          ))}
        </ul>

        <aside
          aria-label="Resumen del carrito"
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24"
        >
          <h2 className="text-lg font-semibold">Resumen</h2>
          <p className="flex items-baseline justify-between">
            <span>Total</span>
            <span className="text-2xl font-bold">
              {formatPrice(quote.total)}
            </span>
          </p>
          <p className="text-xs text-stone-500">
            Los precios y la disponibilidad se confirman al finalizar la compra.
          </p>

          {hasProblems ? (
            <>
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-full bg-slate-200 px-6 py-3 font-medium text-slate-500"
              >
                Finalizar compra
              </button>
              <p className="text-center text-xs text-amber-700">
                Ajusta el carrito para poder continuar.
              </p>
            </>
          ) : (
            <Link
              to="/checkout"
              className="block w-full rounded-full bg-brand-700 px-6 py-3 text-center font-medium text-white hover:bg-brand-800"
            >
              Finalizar compra
            </Link>
          )}

          <div className="flex items-center justify-between text-sm">
            <Link to="/" className="font-medium text-brand-700 hover:underline">
              Seguir comprando
            </Link>
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="cursor-pointer text-red-600 hover:underline"
            >
              Vaciar carrito
            </button>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Vaciar carrito"
        message="¿Seguro que quieres quitar todos los productos del carrito?"
        confirmLabel="Vaciar"
        onConfirm={() => {
          cartActions.clear();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </main>
  );
}
