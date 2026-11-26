import type { OrderStatus, PaymentMethod } from './api'

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

// Clases escritas completas: Tailwind solo genera las que encuentra literales
export const STATUS_CLASS: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-200 text-red-700',
}

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  CASH_ON_DELIVERY: 'Pago contra entrega',
  SINPE_MOVIL: 'SINPE Móvil (se coordina contigo)',
}

export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
  }
  
  export const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
    CONFIRMED: 'Confirmar pedido',
    SHIPPED: 'Marcar como enviado',
    DELIVERED: 'Marcar como entregado',
    CANCELLED: 'Cancelar pedido',
  }