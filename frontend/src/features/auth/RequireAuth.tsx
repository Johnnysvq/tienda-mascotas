import { Link, Navigate, Outlet, useLocation } from "react-router";
import { useCurrentUser } from "./api";

interface RequireAuthProps {
  role?: "ADMIN" | "CUSTOMER"; // sin rol: basta con haber iniciado sesión
}

export function RequireAuth({ role } : RequireAuthProps) {
  const { data: user, isPending, isError } = useCurrentUser();
  const location = useLocation();

  if (isPending) return <p className="page-container py-6 text-slate-500">Cargando...</p>;
  if (isError) {
    return (
      <p role="alert" className="page-container py-6 text-red-600">
        No se pudo verificar la sesión.
      </p>
    );
  }
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  if (role && !user.roles.includes(`ROLE_${role}`)) {
    return (
      <main className="page-container py-12 text-center text-stone-900">
        <h1 className="text-2xl font-bold">Sin permisos</h1>
        <p className="mt-2 text-stone-600">Tu cuenta no puede ver esta sección.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-brand-700 px-6 py-2 text-sm font-medium text-white hover:bg-brand-800"
        >
          Volver a la tienda
        </Link>
      </main>
    )
  }

  return <Outlet />;
}
