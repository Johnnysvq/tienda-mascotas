import { formatPrice } from "../../lib/format";
import type { Product } from "./api";
import { productImage, productImageSrcSet } from "../../lib/images";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="aspect-square bg-slate-100">
        {product.imageKey && (
          <img
            src={productImage(product.imageKey, 480)}
            srcSet={productImageSrcSet(product.imageKey)}
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            alt={product.description}
            width={480}
            height={480}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {product.brand.name}
        </p>
        <h2 className="font-semibold text-slate-900">{product.description}</h2>
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
