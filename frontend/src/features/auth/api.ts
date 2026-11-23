import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '../../lib/api'

export interface CurrentUser {
  username: string
  firstName: string
  roles: string[]
}

export interface RegisterInput {
  firstName: string
  lastName: string
  email: string
  password: string
  phoneNumber: string | null
}

export const isAdmin = (user: CurrentUser | null | undefined): boolean =>
  user?.roles.includes('ROLE_ADMIN') ?? false

// Devuelve el usuario, o null si no hay sesión (el 401 es un resultado normal, no un error)
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
    mutationFn: (credentials: { username: string; password: string }) =>
      api<void>('/auth/login', { method: 'POST', body: new URLSearchParams(credentials) }),
    // Volver a pedir /auth/me carga al usuario y renueva la cookie CSRF
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      await api<void>('/auth/register', { method: 'POST', body: JSON.stringify(input) })
      // La cuenta ya existe: si el inicio de sesión automático falla, el usuario entra a mano
      try {
        await api<void>('/auth/login', {
          method: 'POST',
          body: new URLSearchParams({ username: input.email, password: input.password }),
        })
        return { loggedIn: true }
      } catch {
        return { loggedIn: false }
      }
    },
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
    },
  })
}