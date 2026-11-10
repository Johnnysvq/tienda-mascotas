import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Page } from '../../lib/types'


export interface PetType {
    id: number
    name: string
}

export interface PetTypeInput {
    name: string
}

export function usePetTypes(page=0) {
    return useQuery({
        queryKey: ['pet-types', page],
        queryFn: ({ signal }) => api<Page<PetType>>(`/pet-types?page=${page}&size=20`, { signal }),
        staleTime: 60_000,
        placeholderData: keepPreviousData
    })
}

export function useCreatePetType() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: PetTypeInput) =>
            api<PetType>('/pet-types', { method: 'POST', body: JSON.stringify(input) }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pet-types'] }),
    })
}

export function useUpdatePetType() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ... input}: PetTypeInput & { id: number }) =>
            api<PetType>(`/pet-types/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pet-types'] }),
    })
}

export function useDeletePetType() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => api<void>(`/pet-types/${id}`, { method: 'DELETE' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pet-types'] }),
    })
}