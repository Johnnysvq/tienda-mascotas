import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '../../lib/api'

export interface CurrentUser {
    username: String
    roles: String[]
}

// Devuelve el usuario. o null si no hay sesion
export function useCurrentUser() {
    return useQuery({
        queryKey: ['me'],
        queryFn: async ({ signal }) => {
            try {
                return await api<CurrentUser>('/auth/me', { signal })
            } catch (error) {
                if (error instanceof ApiError && error.status === 401) return null
                throw error
            }
        },
        staleTime: 5 * 60_000,
        retry: false,
    })
}

export function useLogin() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (credentials: { username: string, password: string }) =>
            api<void>('/auth/login', { method: 'POST', body: new URLSearchParams(credentials) }),
        // volver a pedir /auth/me carga al usuario y renueva la cookie CSRF
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
    })
}

export function useLogout() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () => api<void>('/auth/logout', { method: 'POST' }),
        onSuccess: async () => {
            // Borra los datos en caché (p. ej. proveedores) para que no queden tras cerrar sesión
            queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'me' })
            await queryClient.invalidateQueries({ queryKey: ['me'] })
        }
    })
}