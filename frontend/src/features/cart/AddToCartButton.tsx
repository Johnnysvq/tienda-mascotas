import { useState } from "react";
import { Link } from "react-router";
import type { Product } from "../products/api";
import { cartActions, MAX_QUANTITY, useCart } from "./cartStore";
import { QuantityStepper } from "./QuantityStepper";

export function AddToCartButton({ product }: { product: Product }) {
  const { items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<"added" | "full" | null>(null);

  const inCart =
    items.find((item) => item.productId === product.id)?.quantity ?? 0;
  const room = Math.min(product.stock, MAX_QUANTITY) - inCart; // unidades que aún se pueden agregar
  const selected = Math.min(quantity, Math.max(room, 1));

  function handleAdd() {
    const result = cartActions.add(product.id, selected);
    setFeedback(result === "ok" ? "added" : "full");
    setQuantity(1);
  }

  if (product.stock === 0) {
    return (
      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed rounded-full bg-slate-200 px-6 py-3 font-medium text-slate-500 sm:w-auto"
      >
        Agotado
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {room > 0 ? (
        <div className="flex flex-wrap items-center gap-4">
          <QuantityStepper
            label={`Cantidad de ${product.description}`}
            value={selected}
            max={room}
            onChange={(value) => {
              setQuantity(value);
              setFeedback(null);
            }}
          />
          <button
            type="button"
            onClick={handleAdd}
            className="cursor-pointer rounded-full bg-brand-700 px-6 py-3 font-medium text-white hover:bg-brand-800"
          >
            Agregar al carrito
          </button>
        </div>
      ) : (
        <p className="text-sm text-stone-600">
          Ya tienes en el carrito todas las unidades disponibles.
        </p>
      )}

      <p aria-live="polite" className="min-h-5 text-sm text-stone-700">
        {feedback === "added" && (
          <>
            Agregado al carrito.{" "}
            <Link
              to="/cart"
              className="font-medium text-brand-700 hover:underline"
            >
              Ver carrito
            </Link>
          </>
        )}
        {feedback === "full" &&
          "Tu carrito está lleno (máximo 50 productos distintos)."}
      </p>
    </div>
  );
}
