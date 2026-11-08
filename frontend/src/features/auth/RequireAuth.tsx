import { Navigate, Outlet, useLocation } from 'react-router'
import { useCurrentUser } from './api'

export function RequireAuth() {
    const { data: user, isPending, isError } = useCurrentUser()
    const location = useLocation()

    if (isPending) return <p className="p-6 text-slate-500">Cargando...</p>
    if (isError) {
        return <p role="alert" className="p-6 text-red-600">No se pudo verificar la sesión.</p>
    }
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname}}/>
    console.log('user ->', user)
    if (!user.roles.includes('ROLE_ADMIN')) {
        return <p role='alert' className="p-6 text-red-600">No tienes permisos para ver esta sección.</p>
    }

    return <Outlet />
}