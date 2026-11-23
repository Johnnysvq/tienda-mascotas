import { NavLink, Outlet } from "react-router";

const sections = [
  { to: "/admin", label: "Inicio", end: true },
  { to: "/admin/brands", label: "Marcas" },
  { to: "/admin/categories", label: "Categorías" },
  { to: "/admin/pet-types", label: "Tipos Mascota" },
  { to: "/admin/providers", label: "Proveedores" },
  { to: "/admin/products", label: "Productos" },
];

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-naranja text-white shadow-sm shadow-naranja"
      : "text-stone-700 hover:bg-slate-100"
  }`;

export default function AdminLayout() {
  return (
    <main className="page-container space-y-6 py-6 text-stone-900">
      <img
        src="/banner-salchicha.svg"
        alt="Panel de Administración"
        className="mx-auto block h-16 w-auto md:h-20"
      />

      <nav
        aria-label="Secciones del panel"
        className="-mx-1 flex justify-center gap-1 overflow-x-auto px-1 py-1 pb-1"
      >
        {sections.map((section) => (
          <NavLink
            key={section.to}
            to={section.to}
            end={section.end}
            className={tabClass}
          >
            {section.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </main>
  );
}
