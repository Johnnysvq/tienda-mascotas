import { ApiError } from './api'

export function errorMessage(error: unknown): string { 
    if (error instanceof ApiError) {
        if (error.status === 400 || error.status === 404 || error.status === 409) return error.message
        if (error.status === 401) return 'Tu sección expiró. Inicia sesión de nuevo.'
        if (error.status === 403) return 'No tienes permiso o la sesión de seguridad expiró. Recarga la página e inténtalo de nuevo.'
    }
    return 'Occurrió un error inesperado. Inténtalo de nuevo.'
}