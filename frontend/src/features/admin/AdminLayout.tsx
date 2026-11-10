import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useCurrentUser, useLogout } from '../auth/api'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`

export default function AdminLayout() {
  const { data: user } = useCurrentUser()
  const logout = useLogout()
  const navigate = useNavigate()

  function handleLogout() {
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
              onClick={handleLogout}
              disabled={logout.isPending}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
        <nav aria-label="Secciones del panel" className="mx-auto flex max-w-6xl gap-2 px-6 pb-3">
          <NavLink to="/admin" end className={navLinkClass}>
            Inicio
          </NavLink>
          <NavLink to="/admin/brands" className={navLinkClass}>
            Marcas
          </NavLink>
          <NavLink to="/admin/categories" className={navLinkClass}>
            Categorías
          </NavLink>
          <NavLink to="/admin/pet-types" className={navLinkClass}>
            Tipos Mascota
          </NavLink>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl p-6">
        <Outlet />
      </main>
    </div>
  )
}