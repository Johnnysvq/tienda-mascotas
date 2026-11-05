import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Page } from '../../lib/types'

export interface Ref {
    id: number
    name: string
}

export interface Product {
    id: number
    description: string
    detail: string | null
    price: number
    stock: number
    status: 'ACTIVE' | 'INACTIVE'
    imageKey: string | null
    brand: Ref
    category: Ref
    petType: Ref
}

export function useProducts(page = 0) {
    return useQuery({
        queryKey: ['products', page],
        queryFn: ({ signal }) => api<Page<Product>>(`/products?page=${page}&size=12`, { signal }),
        staleTime: 60_000,
        placeholderData: keepPreviousData, // al cambiar de página, mantiene la anterior en pantalla hasta que llega la nueva
    })
}