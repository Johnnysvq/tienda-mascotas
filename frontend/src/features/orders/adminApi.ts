import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '../../lib/api'
import type { Page } from '../../lib/types'
import type { AdminOrderSummary, Order, OrderStatus } from './api'

export function useAdminOrders(page: number, status: OrderStatus | '') {
  return useQuery({
    queryKey: ['admin', 'orders', page, status],
    queryFn: ({ signal }) => {
      const params = new URLSearchParams({ page: String(page), size: '20' })
      params.append('sort', 'createdAt,desc')
      params.append('sort', 'id,desc')
      if (status) params.set('status', status)
      return api<Page<AdminOrderSummary>>(`/admin/orders?${params.toString()}`, { signal })
    },
    staleTime: 15_000,
    placeholderData: keepPreviousData,
  })
}

export function useAdminOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: ({ signal }) => api<Order>(`/admin/orders/${id}`, { signal }),
    enabled: id !== undefined,
    staleTime: 15_000,
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 2,
  })
}

export function useChangeOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      api<Order>(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => {
      // Cancelar devuelve stock y el cliente ve el cambio en su pedido
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    // También tras un conflicto (409): se recarga para mostrar el estado real
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  })
}