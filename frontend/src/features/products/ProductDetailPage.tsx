import { Link, useLocation, useParams } from "react-router";
import { NotFound } from "../../components/NotFound";
import { ApiError } from "../../lib/api";
import { formatPrice } from "../../lib/format";
import { productImage, productImageSrcSet } from "../../lib/images";
import { usePageTitle } from "../../lib/usePageTitle";
import { useProduct } from "./api";
import { ArrowLeft5 } from 'reicon-react';
import { AddToCartButton } from '../cart/AddToCartButton'

const ID_PATTERN = /^\d{1,18}$/;

function backTarget(state: unknown) {
  const from = (state as { from?: unknown } | null)?.from;
  const search =
    typeof from === "string" && from.startsWith("?") && from.length <= 500
      ? from
      : "";
  return { pathname: "/", search };
}

function stockInfo(stock: number): { label: string; className: string } {
  if (stock === 0) return { label: "Agotado", className: "text-red-600" };
  if (stock <= 5)
    return { label: `Quedan ${stock} unidades`, className: "text-amber-700" };
  return { label: "Disponible", className: "text-green-700" };
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const validId = id !== undefined && ID_PATTERN.test(id) ? id : undefined;
  const { data: product, isPending, isError, error } = useProduct(validId);
  usePageTitle(product?.description);

  // Un id mal formado, ni siquiera se envia al servidor
  if (validId === undefined) return <NotFound title="Producto no encontrado" />;
  if (isPending)
    return (
      <p className="page-container py-6 text-slate-500">Cargando producto…</p>
    );
  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return <NotFound title="Producto no encontrado" />;
    }
    return (
      <p role="alert" className="page-container py-6 text-red-600">
        No se pudo cargar el producto.
      </p>
    );
  }

  const stock = stockInfo(product.stock);

  return (
    <main className="page-container py-6 text-stone-900">
      <Link
        to={backTarget(location.state)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-white bg-naranja hover:bg-naranja/90 shadow-sm shadow-naranja hover:shadow-naranja rounded-full px-2 py-1"
      >
        <span aria-hidden="true"><ArrowLeft5 size={24} /></span> Volver al catálogo
      </Link>

      {product.status === "INACTIVE" && (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Este producto está inactivo: los clientes no lo ven, solo tú como
          administrador.
        </p>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white">
          {product.imageKey ? (
            <img
              src={productImage(product.imageKey, 800)}
              srcSet={productImageSrcSet(product.imageKey, [400, 800, 1200])}
              sizes="(min-width: 768px) 50vw, 100vw"
              alt={product.description}
              width={800}
              height={800}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Sin imagen
            </div>
          )}
        </div>

        <div className="space-y-4">
          <p className="w-fit max-w-full truncate rounded-full bg-cafe px-2 py-1 text-sm font-medium uppercase tracking-wide text-white">
            {product.brand.name}
          </p>
          <h1 className="text-3xl font-bold leading-tight">
            {product.description}
          </h1>

          <p className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-white px-3 py-1 text-stone-700 ring-1 ring-slate-200">
              {product.category.name}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-stone-700 ring-1 ring-slate-200">
              {product.petType.name}
            </span>
          </p>

          <p className="text-3xl font-bold">{formatPrice(product.price)}</p>
          <p className={`font-medium ${stock.className}`}>{stock.label}</p>
          {product.status === 'ACTIVE' && <AddToCartButton product={product} />}

          {product.detail && (
            <section
              aria-labelledby="detail-heading"
              className="border-t border-slate-200 pt-4"
            >
              <h2 id="detail-heading" className="mb-2 text-lg font-semibold">
                Detalle
              </h2>
              <p className="whitespace-pre-line text-stone-700">
                {product.detail}
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
