// src/pages/medico/MedicoLayout.jsx
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarClock,
  Stethoscope,
  User,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Logo from "../../components/ui/Logo";         // mismo Logo que usas en Admin
import { logoutMedico } from "../../api/auth.medico";
import { getMedicoInfo } from "../../api/medico_info";

const links = [
  { to: "/medico", label: "Dashboard", Icon: LayoutDashboard, end: true },
  { to: "/medico/citas", label: "Citas", Icon: CalendarClock },
  { to: "/medico/especialidades", label: "Especialidades", Icon: Stethoscope },
  { to: "/medico/perfil", label: "Perfil", Icon: User },
];

export default function MedicoLayout() {
  const nav = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [medicoInfo, setMedicoInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Anchos sincronizados con AdminLayout
  const SIDEBAR_W = collapsed ? "w-20" : "w-64";
  const SIDEBAR_W_PX = collapsed ? "80px" : "256px";

  useEffect(() => {
    const token = localStorage.getItem("clinix_token_medico");
    const userData = localStorage.getItem("clinix_user_medico");

    if (!token || !userData) {
      setLoading(false);
      nav("/medico/login", { replace: true });
      return;
    }

    try {
      setUser(JSON.parse(userData));
      
      // Cargar información actualizada del médico desde la base de datos
      (async () => {
        try {
          const res = await getMedicoInfo();
          if (res?.success) {
            setMedicoInfo(res.data);
          }
        } catch (error) {
          console.error("Error cargando información del médico:", error);
        }
      })();
    } catch {
      logoutMedico();
      nav("/medico/login", { replace: true });
      return;
    } finally {
      setLoading(false);
    }
  }, [nav]);

  // Escuchar eventos de actualización del perfil
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      const { nombre } = event.detail;
      if (nombre) {
        setMedicoInfo(prev => ({
          ...prev,
          nombre: nombre
        }));
      }
    };

    window.addEventListener('medicoProfileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('medicoProfileUpdated', handleProfileUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-2 text-sm text-slate-600">Cargando…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* GRID base: header + contenido; en desktop agrega la col del sidebar */}
      <div
        className={`grid h-full grid-rows-[56px_1fr] grid-cols-1 md:[grid-template-columns:var(--sb)_1fr]`}
        style={{ "--sb": SIDEBAR_W_PX }}
      >
        {/* ================= HEADER (igual que Admin) ================= */}
        <header className="row-start-1 col-span-1 md:col-span-2 flex items-stretch border-b border-slate-200 bg-white/85 backdrop-blur">
          {/* Izquierda: ancho del sidebar (Logo + toggle) */}
          <div
            className={`hidden md:flex items-center justify-between border-r border-slate-200 px-3 ${SIDEBAR_W}`}
          >
            {/* Puedes personalizar Logo para que diga Clinix Médico si tu componente lo soporta */}
            <Logo compact={collapsed} />
            <button
              onClick={() => setCollapsed((s) => !s)}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
              title={collapsed ? "Expandir menú" : "Colapsar menú"}
              aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Derecha: botón menú móvil + info rápida del médico */}
          <div className="flex flex-1 items-center justify-between px-3">
            <button
              className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>

            <div className="ml-auto flex items-center gap-3 text-sm text-slate-600">
              <span className="hidden sm:flex items-center gap-2">
                <span className="font-medium text-slate-800">
                  {medicoInfo?.nombre || user?.nombre || "Médico"}
                </span>
                {medicoInfo?.especialidades && medicoInfo.especialidades.length > 0 && (
                  <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs">
                    {medicoInfo.especialidades.length === 1 
                      ? medicoInfo.especialidades[0]
                      : `${medicoInfo.especialidades[0]} +${medicoInfo.especialidades.length - 1}`
                    }
                  </span>
                )}
                {!medicoInfo?.especialidades && user?.especialidad && (
                  <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs">
                    {user.especialidad}
                  </span>
                )}
              </span>
            </div>
          </div>
        </header>

        {/* ================= SIDEBAR desktop ================= */}
        <aside
          className={`row-start-2 col-start-1 hidden md:flex h-full flex-col border-r border-slate-200 bg-white/90 backdrop-blur ${SIDEBAR_W} transition-[width] duration-200 overflow-y-auto`}
          aria-label="Menú médico"
        >
          {/* Tarjeta mini de perfil (solo cuando no está colapsado) */}
          {!collapsed && (
            <div className="px-3 pt-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-sm">
                  <div className="font-semibold text-slate-900 truncate">
                    {medicoInfo?.nombre || user?.nombre || "Médico"}
                  </div>
                  {medicoInfo?.especialidades && medicoInfo.especialidades.length > 0 && (
                    <div className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      {medicoInfo.especialidades.length === 1 
                        ? medicoInfo.especialidades[0]
                        : `${medicoInfo.especialidades[0]} +${medicoInfo.especialidades.length - 1}`
                      }
                    </div>
                  )}
                  {!medicoInfo?.especialidades && user?.especialidad && (
                    <div className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      {user.especialidad}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <nav className="mt-2 flex-1 space-y-1 px-2">
            {links.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                title={label}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium
                   hover:bg-emerald-50 hover:text-emerald-700
                   ${isActive ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200" : "text-slate-600"}`
                }
              >
                <Icon className="shrink-0" size={18} />
                <span className={`${collapsed ? "hidden" : "inline"} truncate`}>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-200 px-2 pb-3 pt-1">
            <button
              onClick={() => {
                logoutMedico();
                nav("/medico/login", { replace: true });
              }}
              title="Cerrar sesión"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut size={18} />
              <span className={`${collapsed ? "hidden" : "inline"}`}>Cerrar sesión</span>
            </button>
          </div>
        </aside>
        

        {/* ================= DRAWER móvil ================= */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div
              className="fixed inset-y-0 left-0 z-50 w-64 md:hidden"
              role="dialog"
              aria-label="Menú móvil médico"
              onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
            >
              <div className="flex h-full flex-col border-r border-slate-200 bg-white/95 backdrop-blur overflow-y-auto">
                <div className="flex items-center justify-between px-3 py-4">
                  <Logo compact={false} />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                    aria-label="Cerrar menú"
                  >
                    <ChevronLeft size={18} />
                  </button>
                </div>

                {/* Perfil corto */}
                <div className="px-3 pb-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-sm">
                      <div className="font-semibold text-slate-900 truncate">
                        {medicoInfo?.nombre || user?.nombre || "Médico"}
                      </div>
                      {medicoInfo?.especialidades && medicoInfo.especialidades.length > 0 && (
                        <div className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                          {medicoInfo.especialidades.length === 1 
                            ? medicoInfo.especialidades[0]
                            : `${medicoInfo.especialidades[0]} +${medicoInfo.especialidades.length - 1}`
                          }
                        </div>
                      )}
                      {!medicoInfo?.especialidades && user?.especialidad && (
                        <div className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                          {user.especialidad}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <nav className="mt-1 flex-1 space-y-1 px-2">
                  {links.map(({ to, label, Icon, end }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={end}
                      title={label}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium
                         hover:bg-emerald-50 hover:text-emerald-700
                         ${isActive ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200" : "text-slate-600"}`
                      }
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon className="shrink-0" size={18} />
                      <span className="truncate">{label}</span>
                    </NavLink>
                  ))}
                </nav>

                <div className="border-t border-slate-200 px-2 pb-3 pt-1">
                  <button
                    onClick={() => {
                      logoutMedico();
                      nav("/medico/login", { replace: true });
                    }}
                    title="Cerrar sesión"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <LogOut size={18} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= CONTENIDO ================= */}
        <main className="row-start-2 col-start-1 md:col-start-2 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
