const API_BASE = '/api/v1'

export class ApiError extends Error {
    status: number
    errors?: Record<string, string>

    constructor(status: number, message: string, errors?: Record<string, string>) {
        super(message)
        this.status = status
        this.errors = errors
    }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')
    if (init.body) headers.set('Content-Type', 'application/json')
    
    const res = await fetch(`${API_BASE}${path}`,{ ...init, headers})

    if (!res.ok) {
        // El GlobalExeptionHandler responde con ProblemDetail
        const problem = await res.json().catch(() => null)
        throw new ApiError(res.status, problem?.detail ?? 'Error inesperado', problem?.errors)
    }

    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
}