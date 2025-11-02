import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Building2,
    Stethoscope,
    UserCog,
    CalendarClock,
    Users,
    LogOut,
    Menu,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Logo from "../../components/ui/Logo";
import { logout } from "../../api/auth";
// import CircuitBreakerNotification from "../../components/admin/CircuitBreakerNotification";
// DESACTIVADO: Se usa el script inline en index.html para las notificaciones del circuit breaker

const links = [
    { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, end: true },
    { to: "/admin/especialidades", label: "Especialidades", Icon: Stethoscope },
    { to: "/admin/hospitales", label: "Hospitales", Icon: Building2 },

    { to: "/admin/medicos", label: "Médicos", Icon: UserCog },
    { to: "/admin/citas", label: "Citas", Icon: CalendarClock },
    { to: "/admin/empleados", label: "Empleados", Icon: Users },
];

export default function AdminLayout() {
    const nav = useNavigate();
    const user = JSON.parse(localStorage.getItem("clinix_user") || "null");
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // para reutilizar clases según el ancho del sidebar
    const SIDEBAR_W = collapsed ? "w-20" : "w-64";
    const SIDEBAR_W_PX = collapsed ? "80px" : "256px"; // para el header

    return (
        <div className="h-screen overflow-hidden bg-slate-50 text-slate-900">
            {/* GRID base: en móvil 1 columna; en desktop 2 columnas (sidebar + contenido) */}
            <div
                className={`grid h-full grid-rows-[56px_1fr] grid-cols-1 md:[grid-template-columns:var(--sb)_1fr]`}
                style={{ "--sb": SIDEBAR_W_PX }}
            >
                {/* ================= HEADER (una sola barra) ================= */}
                <header className="row-start-1 col-span-1 md:col-span-2 flex items-stretch border-b border-slate-200 bg-white/85 backdrop-blur">
                    {/* Columna izquierda del header: misma anchura que el sidebar (logo + toggle) */}
                    <div
                        className={`hidden md:flex items-center justify-between border-r border-slate-200 px-3 ${SIDEBAR_W}`}
                    >
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

                    {/* Columna derecha del header: menú móvil + email */}
                    <div className="flex flex-1 items-center justify-between px-3">
                        {/* botón menú (solo móvil) */}
                        <button
                            className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Abrir menú"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="ml-auto flex items-center gap-3 text-sm text-slate-600">
                            <span className="hidden sm:inline">{user?.email}</span>
                        </div>
                    </div>
                </header>

                {/* ================= SIDEBAR (pegado al header) ================= */}
                <aside
                    className={`row-start-2 col-start-1 hidden md:flex h-full flex-col border-r border-slate-200 bg-white/90 backdrop-blur ${SIDEBAR_W} transition-[width] duration-200 overflow-y-auto`}
                    aria-label="Menú de administración"
                >
                    {/* (ya NO repetimos el Logo aquí; va en el header a la izquierda) */}

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
                  ${isActive
                                        ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
                                        : "text-slate-600"
                                    }`
                                }
                            >
                                <Icon className="shrink-0" size={18} />
                                <span className={`${collapsed ? "hidden" : "inline"} truncate`}>
                                    {label}
                                </span>
                            </NavLink>
                        ))}
                    </nav>

                    <div className="border-t border-slate-200 px-2 pb-3 pt-1">
                        <button
                            onClick={() => {
                                logout();
                                nav("/admin/login", { replace: true });
                            }}
                            title="Cerrar sesión"
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                            <LogOut size={18} />
                            <span className={`${collapsed ? "hidden" : "inline"}`}>Cerrar sesión</span>
                        </button>
                    </div>
                </aside>

                {/* ================= DRAWER (sidebar móvil) ================= */}
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
                            aria-label="Menú móvil"
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
                        ${isActive
                                                    ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
                                                    : "text-slate-600"
                                                }`
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
                                            logout();
                                            nav("/admin/login", { replace: true });
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

                {/* ================= CONTENIDO (scroll independiente) ================= */}
                <main className="row-start-2 col-start-1 md:col-start-2 overflow-y-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
            
            {/* Notificación global de Circuit Breaker - DESACTIVADA: Se usa el script inline en index.html */}
            {/* El script inline en index.html maneja las notificaciones del circuit breaker */}
        </div>
    );
}
