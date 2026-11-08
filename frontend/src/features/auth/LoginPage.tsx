import { useState, type SyntheticEvent } from 'react'
import { Navigate, useLocation } from 'react-router'
import { ApiError } from '../../lib/api'
import { useCurrentUser, useLogin } from './api'

function loginErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        if (error.status === 401) return 'Usuario o contraseña incorrectos.'
        if (error.status === 429) return 'Demasiade intentos fallidos. Espera unos minutos en inténtalo de nuevo.'
        if (error.status === 403) return 'La sesión de seguridad expiró. Recarga la página e inténtalo de nuevo.'
    }
    return 'No se pudo iniciar sesión. Inténtalo de nuevo.'
}

export default function LoginPage() {
    const { data: user, isPending } = useCurrentUser()
    const login = useLogin()
    const location = useLocation()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    // Espera a /auth/me garantiza que ya existe la cookie CSRF antes de enviar el formulario
    if (isPending) return <p className="p-6 text-slate-500">Cargando...</p>

    // Solo vuelve a rutas internas del panel
    const from = (location.state as { from?: string } | null)?.from
    const target = from === '/admin' || from?.startsWith('/admin/') ? from : '/admin'
    if (user) return <Navigate to={target} replace />

    function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
        event.preventDefault()
        login.mutate({ username, password }, { onError: () => setPassword('') })
    }

    const inputClass =
        'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 ' +
        'focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500'

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
            <form 
              onSubmit={handleSubmit}
              className="w-full max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-6"
            >
                <h1 className="text-xl font-bold text-slate-900">Iniciar sesión</h1>

                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                        Usuario
                    </label>
                    <input
                        id="username"
                        type="text"
                        autoComplete="username"
                        required
                        maxLength={100}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                        Contraseña
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        maxLength={200}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                    />
                </div>

                {login.isError && (
                    <p role="alert" className="text-sm text-red-600">
                        {loginErrorMessage(login.error)}
                    </p>
                )}

                <button
                  type="submit"
                  disabled={login.isPending}
                  className="w-full rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60:"
                >
                    {login.isPending ? 'Entrando...' : 'Entrar'}   
                </button>
            </form>
        </main>
    )
}