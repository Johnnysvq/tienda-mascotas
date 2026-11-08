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

// Spring guarda el token CSRF en una cookie legible por JavaScript
function readCsrfToken(): string | undefined {
  const entry = document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))
  return entry ? decodeURIComponent(entry.slice('XSRF-TOKEN='.length)) : undefined
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  // Con URLSearchParams, fetch pone solo el Content-Type de formulario
  if (init.body && !(init.body instanceof URLSearchParams)) {
    headers.set('Content-Type', 'application/json')
  }

  if (method !== 'GET' && method !== 'HEAD') {
    const token = readCsrfToken()
    if (token) headers.set('X-XSRF-TOKEN', token)
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })

  if (!res.ok) {
    const problem = await res.json().catch(() => null)
    throw new ApiError(res.status, problem?.detail ?? 'Error inesperado', problem?.errors)
  }

  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}