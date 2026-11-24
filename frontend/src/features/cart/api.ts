import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { CartItem } from "./cartStore";

export interface QuoteLine {
  productId: number;
  description: string | null;
  imageKey: string | null;
  unitPrice: number | null;
  requestedQuantity: number;
  quantity: number;
  availableStock: number;
  status: "OK" | "LIMITED" | "OUT_OF_STOCK" | "UNAVAILABLE";
  subtotal: number | null;
}

export interface CartQuote {
  items: QuoteLine[];
  total: number;
}

export function useCartQuote(items: CartItem[], ready: boolean) {
  return useQuery({
    queryKey: ["cart", "quote", items],
    queryFn: ({ signal }) =>
      api<CartQuote>("/cart/quote", {
        method: "POST",
        body: JSON.stringify({ items }),
        signal,
      }),
    enabled: ready && items.length > 0,
    staleTime: 15_000,
    placeholderData: keepPreviousData,
  });
}
