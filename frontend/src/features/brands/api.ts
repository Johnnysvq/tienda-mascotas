import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Page } from '../../lib/types'

export interface Brand {
  id: number
  name: string
}

export interface BrandInput {
  name: string
}

export function useBrands(page = 0) {
  return useQuery({
    queryKey: ['brands', page],
    queryFn: ({ signal }) => api<Page<Brand>>(`/brands?page=${page}&size=20`, { signal }),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
}

export function useCreateBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: BrandInput) =>
      api<Brand>('/brands', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
  })
}

export function useUpdateBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: BrandInput & { id: number }) =>
      api<Brand>(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
  })
}

export function useDeleteBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api<void>(`/brands/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
  })
}