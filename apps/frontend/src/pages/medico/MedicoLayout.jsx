import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import Logo from "../../components/ui/Logo";

const linkBase = "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-white hover:shadow-sm";
const linkActive = "bg-white shadow-sm ring-1 ring-slate-200 text-slate-900";
const linkInactive = "text-slate-700 ring-1 ring-transparent";

export default function MedicoLayout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f5f5" }}>
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link to="/medico" className="flex items-center gap-3">
            <Logo />
            <span className="text-sm font-semibold text-slate-800">Panel Médico</span>
          </Link>
          <Link to="/logout" className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
            Cerrar sesión
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-6 py-6">
        <aside className="col-span-12 md:col-span-3">
          <nav className="grid gap-2">
            <NavLink to="/medico/citas"
              className={({ isActive }) => `${linkBase} ${isActive || pathname==="/medico" ? linkActive : linkInactive}`}>
              <span>🗓️</span> Citas
            </NavLink>
            <NavLink to="/medico/especialidades"
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
              <span>🩺</span> Especialidades
            </NavLink>
            <NavLink to="/medico/perfil"
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
              <span>👤</span> Perfil
            </NavLink>
          </nav>
        </aside>

        <section className="col-span-12 md:col-span-9">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
