import { Link } from "react-router";
import { useCart } from "./cartStore";

export function CartLink({ className = "" }: { className?: string }) {
  const { count } = useCart();
  const label =
    count === 0
      ? "Carrito vacío"
      : `Carrito, ${count} ${count === 1 ? "producto" : "productos"}`;

  return (
    <Link
      to="/cart"
      aria-label={label}
      className={`relative inline-flex p-2 ${className}`}
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-naranja px-1 text-xs font-bold text-white"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
