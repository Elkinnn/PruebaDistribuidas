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

const links = [
    { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, end: true },
    { to: "/admin/hospitales", label: "Hospitales", Icon: Building2 },
    { to: "/admin/especialidades", label: "Especialidades", Icon: Stethoscope },
    { to: "/admin/medicos", label: "Médicos", Icon: UserCog },
    { to: "/admin/citas", label: "Citas", Icon: CalendarClock },
    { to: "/admin/empleados", label: "Empleados", Icon: Users },
];

export default function AdminLayout() {
    const nav = useNavigate();
    const user = JSON.parse(localStorage.getItem("clinix_user") || "null");
    const [collapsed, setCollapsed] = useState(false);   // desktop collapse
    const [mobileOpen, setMobileOpen] = useState(false); // drawer mobile

    const Sidebar = (
        <aside
            className={`flex h-full flex-col bg-white/90 backdrop-blur-sm border-r border-slate-200
      ${collapsed ? "w-20" : "w-64"} transition-[width] duration-200`}
            aria-label="Menú de navegación de administrador"
        >
            {/* Top / logo */}
            <div className="flex items-center justify-between px-3 py-4">
                <div className="flex items-center gap-2">
                    <Logo compact={collapsed} />
                </div>
                {/* Toggle collapse (solo desktop) */}
                <button
                    onClick={() => setCollapsed((s) => !s)}
                    className="hidden md:inline-flex rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                    title={collapsed ? "Expandir" : "Colapsar"}
                    aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Nav */}
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
                        onClick={() => setMobileOpen(false)}
                    >
                        <Icon className="shrink-0" size={18} />
                        {/* etiqueta/hide en colapso */}
                        <span className={`${collapsed ? "hidden" : "inline"} truncate`}>
                            {label}
                        </span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="px-2 pb-3 pt-1 border-t border-slate-200">
                <button
                    onClick={() => {
                        logout();
                        nav("/login", { replace: true });
                    }}
                    title="Cerrar sesión"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                >
                    <LogOut size={18} />
                    <span className={`${collapsed ? "hidden" : "inline"}`}>Cerrar sesión</span>
                </button>
            </div>
        </aside>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Topbar */}
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-3 backdrop-blur">
                {/* Mobile menu button */}
                <button
                    className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Abrir menú"
                >
                    <Menu size={20} />
                </button>

                <div className="hidden md:flex items-center gap-2 px-1" />

                <div className="ml-auto flex items-center gap-3 pr-1 text-sm text-slate-600">
                    <span className="hidden sm:inline">{user?.email}</span>
                </div>
            </header>

            {/* Layout grid */}
            <div className="mx-auto flex w-full max-w-7xl">
                {/* Sidebar desktop */}
                <div className="sticky top-14 hidden h-[calc(100vh-56px)] md:block">
                    {Sidebar}
                </div>

                {/* Drawer mobile */}
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
                            {Sidebar}
                        </div>
                    </>
                )}

                {/* Content */}
                <main className="min-h-[calc(100vh-56px)] flex-1 p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
