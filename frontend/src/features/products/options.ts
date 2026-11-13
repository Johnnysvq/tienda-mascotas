import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Page } from '../../lib/types'
import type { Ref } from './api'

export type OptionsResource = 'brands' | 'categories' | 'pet-types' | 'providers'

export function useOptions(resource: OptionsResource) {
    return useQuery({
        queryKey: [resource, 'options'],
        queryFn: ({ signal }) => api<Page<Ref>>(`/${resource}?page=0&size=100`, { signal }),
        staleTime: 5 * 60_000
    })
}