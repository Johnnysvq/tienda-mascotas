import { formatPrice } from "../../lib/format";
import type { Product } from "./api";
import { productImage, productImageSrcSet } from "../../lib/images";
import { Link } from "react-router";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  return (
    <article className="relative flex w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-formBg shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-within:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="aspect-square bg-slate-100">
        {product.imageKey && (
          <img
            src={productImage(product.imageKey, 480)}
            srcSet={productImageSrcSet(product.imageKey)}
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            alt={product.description}
            width={480}
            height={480}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h2 className="font-semibold text-slate-900">
          <Link
            to={`/products/${product.id}`}
            state={{ from: location.search }}
            className="rounded-sm after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
          >
            {product.description}
          </Link>
        </h2>
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {product.brand.name}
        </p>
        <p className="text-sm text-slate-500">
          {product.category.name} · {product.petType.name}
        </p>
        <p className="mt-auto pt-2 text-lg front-bold text-slate-900">
          {formatPrice(product.price)}
        </p>
        {product.stock === 0 && (
          <p className="text-sm font-medium text-red-600">Agotado</p>
        )}
      </div>
    </article>
  );
}
