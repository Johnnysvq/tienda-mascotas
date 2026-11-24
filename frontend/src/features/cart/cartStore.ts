import { useSyncExternalStore } from "react";
import { z } from "zod";

const STORAGE_KEY = "tienda.cart.v1";
export const MAX_LINES = 50;
export const MAX_QUANTITY = 99;

const cartSchema = z
  .array(
    z.object({
      productId: z.number().int().positive(),
      quantity: z.number().int().min(1).max(MAX_QUANTITY),
    }),
  )
  .max(MAX_LINES);

export type CartItem = z.infer<typeof cartSchema>[number];

function read(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = cartSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

let items: CartItem[] = read();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function write(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Sin almacenamiento disponible: el carrito vive solo mientras la pestaña esté abierta
  }
  notify();
}

// Mantiene sincronizadas varias pestañas abiertas
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY || event.key === null) {
    items = read();
    notify();
  }
});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const cartActions = {
  add(productId: number, quantity = 1): "ok" | "full" {
    const amount = Math.max(1, Math.floor(quantity));
    const existing = items.find((item) => item.productId === productId);
    if (!existing && items.length >= MAX_LINES) return "full";

    const next = Math.min((existing?.quantity ?? 0) + amount, MAX_QUANTITY);

    write(
      existing
        ? items.map((item) =>
            item.productId === productId ? { ...item, quantity: next } : item,
          )
        : [...items, { productId, quantity: next }],
    );
    return "ok";
  },

  setQuantity(productId: number, quantity: number) {
    if (!Number.isFinite(quantity) || quantity < 1) {
      this.remove(productId);
      return;
    }
    const clamped = Math.min(Math.floor(quantity), MAX_QUANTITY);
    write(
      items.map((item) =>
        item.productId === productId ? { ...item, quantity: clamped } : item,
      ),
    );
  },

  remove(productId: number) {
    write(items.filter((item) => item.productId !== productId));
  },

  clear() {
    write([]);
  },

  reconcile(lines: { productId: number; quantity: number }[]) {
    const effective = new Map(
      lines.map((line) => [line.productId, line.quantity]),
    );
    write(
      items.flatMap((item) => {
        const quantity = effective.get(item.productId);
        if (quantity === undefined) return [item];
        return quantity > 0 ? [{ ...item, quantity }] : [];
      }),
    );
  },
};

export function useCart() {
  const current = useSyncExternalStore(subscribe, () => items);
  const count = current.reduce((sum, item) => sum + item.quantity, 0);
  return { items: current, count };
}
