import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useCurrentUser, useLogout } from "../features/auth/api";
import { Logout, Login } from "reicon-react";

export function SiteNavbar() {
  const { data: user, isPending } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 10);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdmin = user?.roles.includes("ROLE_ADMIN") ?? false;

  const navLinks = [
    { name: "Tienda", path: "/", end: true },
    ...(isAdmin
      ? [{ name: "Administración", path: "/admin", end: false }]
      : []),
  ];

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Con el menú móvil abierto: Esc lo cierra y la página de fondo no se desplaza
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  function handleLogout() {
    setIsMenuOpen(false);
    logout.mutate(undefined, {
      onSuccess: () => navigate("/", { replace: true }),
    });
  }

  const barClass = isScrolled
    ? "bg-white/80 text-stone-800 shadow-md backdrop-blur-lg"
    : "bg-[#13272E] text-white";
  const underlineClass = isScrolled ? "bg-stone-800" : "bg-white";
  const buttonClass =
    "inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors disabled:opacity-60 " +
    (isScrolled
      ? "bg-naranja text-white hover:bg-naranja/90"
      : "bg-white text-brand-800 hover:bg-stone-100");

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-colors duration-500 ${barClass}`}
      >
        <nav
          aria-label="Principal"
          className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 md:py-4"
        >
          <Link to="/" className="text-xl font-bold tracking-tight">
            Tienda Mascotas
          </Link>
          {/* Escritorio */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className="group flex flex-col gap-0.5 text-sm font-semibold"
              >
                {({ isActive }) => (
                  <>
                    {link.name}
                    <span
                      className={`${underlineClass} h-0.5 transition-all duration-300 ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {user && (
              <span className="text-sm opacity-90">{user.username}</span>
            )}
            {!isPending &&
              (user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  className={buttonClass}
                >
                  Cerrar sesión<Logout size={18} />
                </button>
              ) : (
                <Link to="/login" className={buttonClass}>
                  Iniciar sesión<Login size={18} />
                </Link>
              ))}
          </div>

          {/* Botón del menú móvil */}
          <button
            type="button"
            className="cursor-pointer p-2 md:hidden"
            aria-label="Abrir menú"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen(true)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        </nav>
      </header>

      <div
        id="mobile-menu"
        inert={!isMenuOpen}
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white text-lg font-medium text-stone-800 transition-transform duration-500 md:hidden ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          className="absolute right-4 top-4 cursor-pointer p-2"
          aria-label="Cerrar menú"
          onClick={() => setIsMenuOpen(false)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setIsMenuOpen(false)}
          >
            {link.name}
          </Link>
        ))}

        {user && (
          <span className="text-sm text-stone-500">{user.username}</span>
        )}
        {!isPending &&
          (user ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={logout.isPending}
              className="cursor-pointer rounded-full bg-naranja px-8 py-2.5 text-base text-white hover:bg-brand-800 disabled:opacity-60"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-full bg-naranja px-8 py-2.5 text-base text-white hover:bg-brand-800"
            >
              Iniciar sesión
            </Link>
          ))}
      </div>
    </>
  );
}
