import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { RequireAuth } from './features/auth/RequireAuth'
import { StorePage } from './features/products/StorePage'

const LoginPage = lazy(() => import('./features/auth/LoginPage'))
const AdminLayout = lazy(() => import('./features/admin/AdminLayout'))
const AdminHome = lazy(() => import('./features/admin/AdminHome'))

export default function App() {
  return (
    <Suspense fallback={<p className="p-6 text-slate-500">Cargando…</p>}>
      <Routes>
        <Route path="/" element={<StorePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
          </Route>
        </Route>
        <Route path="*" element={<p className="p-6">Página no encontrada.</p>} />
      </Routes>
    </Suspense>
  )
}