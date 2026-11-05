import { useState } from "react";
import { useProducts } from "./api";
import { ProductCard } from "./ProductCard";

const buttonClass =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 " +
  "hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

export function ProductList() {
  const [page, setPage] = useState(0);
  const { data, isPending, isError, isPlaceholderData } = useProducts(page);

  if (isError) return <p className="text-slate-500">Cargando productos...</p>;
  if (isPending) {
    return (
      <p role="alert" className="text-red-600">
        No se pudo cargar el catálogo.
      </p>
    );
  }
  if (data.content.length === 0) {
    return <p className="text-slate-500">No hay productos disponibles.</p>;
  }

  const { number, totalPages } = data.page;

  return (
    <>
      <ul
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${isPlaceholderData ? "opacity-60" : ""}`}
      >
        {data.content.map((product) => (
          <li key={product.id} className="flex">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>

      <nav
        aria-label="Paginación"
        className="mt-6 flex items-center justify-between"
      >
        <button
          type="button"
          className={buttonClass}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={number === 0}
        >
          Anterior
        </button>
        <span className="text-sm text-slate-600">
          Página {number + 1} de {totalPages}
        </span>
        <button
          type="button"
          className={buttonClass}
          onClick={() => setPage((p) => p + 1)}
          disabled={number + 1 >= totalPages || isPlaceholderData}
        >
          Siguiente
        </button>
      </nav>
    </>
  );
}
