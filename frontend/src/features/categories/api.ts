import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Page } from '../../lib/types'


export interface Category {
    id: number
    name: string
}

export interface CategoryInput {
    name: string
}

export function useCategories(page=0) {
    return useQuery({
        queryKey: ['categories', page],
        queryFn: ({ signal }) => api<Page<Category>>(`/categories?page=${page}&size=20`, { signal }),
        staleTime: 60_000,
        placeholderData: keepPreviousData
    })
}

export function useCreateCategory() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: CategoryInput) =>
            api<Category>('/categories', { method: 'POST', body: JSON.stringify(input) }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    })
}

export function useUpdateCategory() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ... input}: CategoryInput & { id: number }) =>
            api<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    })
}

export function useDeleteCategory() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => api<void>(`/categories/${id}`, { method: 'DELETE' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    })
}