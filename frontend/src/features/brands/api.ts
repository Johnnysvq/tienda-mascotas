import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Page } from '../../lib/types'

export interface Brand {
    id: number
    name: string
}

export function useBrands(page = 0) {
    return useQuery({
        queryKey: ['brands', page],
        queryFn: ({ signal }) => api<Page<Brand>>(`/brands?page=${page}&size=20`, { signal }),
        staleTime: 60_000, // Durante 1 minuto no vuelve a pedir lo mismo al servidor
    })
}