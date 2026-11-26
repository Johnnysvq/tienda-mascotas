import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '../../lib/api'
import type { Page } from '../../lib/types'
import type { CartItem } from '../cart/cartStore'

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type PaymentMethod = 'CASH_ON_DELIVERY' | 'SINPE_MOVIL'

export interface OrderSummary {
  id: number
  status: OrderStatus
  total: number
  createdAt: string
}

export interface OrderLine {
  productId: number
  description: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface Order extends OrderSummary {
  paymentMethod: PaymentMethod
  recipientName: string
  phoneNumber: string
  address: string
  notes: string | null
  items: OrderLine[]
  history: OrderChange[]
  customer: OrderCustomer | null // solo lo recibe un administrador
}

export interface OrderInput {
  items: CartItem[]
  recipientName: string
  phoneNumber: string
  address: string
  notes: string | null
  paymentMethod: PaymentMethod
}

export interface OrderChange {
    from: OrderStatus
    to: OrderStatus
    at: string
    by: string | null // solo lo recibe un administrador
  }

  export interface OrderCustomer {
    id: number
    name: string
    email: string
  }

  export interface AdminOrderSummary extends OrderSummary {
    customerName: string
  }

export function useOrders(page = 0) {
  return useQuery({
    queryKey: ['orders', page],
    queryFn: ({ signal }) => api<Page<OrderSummary>>(`/orders?page=${page}&size=10`, { signal }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['orders', 'detail', id],
    queryFn: ({ signal }) => api<Order>(`/orders/${id}`, { signal }),
    enabled: id !== undefined,
    staleTime: 30_000,
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 2,
  })
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ input, idempotencyKey }: { input: OrderInput; idempotencyKey: string }) =>
      api<Order>('/orders', {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      // El stock cambió: el catálogo, el carrito y la lista de pedidos deben volver a pedirse
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}

export function useCancelOrder() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (id: number) => api<Order>(`/orders/${id}/cancel`, { method: 'POST' }),
      onSuccess: (order) => {
        queryClient.setQueryData(['orders', 'detail', String(order.id)], order)
        // Cancelar devuelve stock: el catálogo debe volver a pedirse
        queryClient.invalidateQueries({ queryKey: ['orders'] })
        queryClient.invalidateQueries({ queryKey: ['products'] })
        queryClient.invalidateQueries({ queryKey: ['admin'] })
      },
    })
  }