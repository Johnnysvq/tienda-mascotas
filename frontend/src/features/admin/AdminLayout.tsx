import { Link, Outlet, useNavigate } from 'react-router'
import { useCurrentUser, useLogout } from '../auth/api'

export default function AdminLayout() {
    const { data: user } = useCurrentUser()
    const logout = useLogout()
    const navigate = useNavigate()
    
    function handleLogoud() {
        logout.mutate(undefined, { onSuccess: () => navigate('/login', { replace: true }) })
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link to="/admin" className="text-xl font-bold">
                        Panel de Administración
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-600">{user?.username}</span>
                        <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
                            Ver Tienda
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogoud}
                          disabled={logout.isPending}
                          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                          >
                            Cerrar Sesión    
                        </button>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-6xl p-6">
                <Outlet />
            </main>
        </div>
    )
}