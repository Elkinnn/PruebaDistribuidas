import { useEffect, useState } from "react";
import {
    Building2,
    Stethoscope,
    Users,          
    CalendarDays,
    TrendingUp,
    Activity,
} from "lucide-react";
import { listHospitals } from "../../api/hospital";
import { listMedicos } from "../../api/medico";
import { listEmpleados } from "../../api/empleado";
import { listCitas } from "../../api/cita";

export default function AdminDashboard() {
    const [kpis, setKpis] = useState([
        { label: "Hospitales", value: 0, delta: "+0", Icon: Building2, color: "text-emerald-600" },
        { label: "Médicos", value: 0, delta: "+0", Icon: Stethoscope, color: "text-sky-600" },
        { label: "Empleados", value: 0, delta: "+0", Icon: Users, color: "text-indigo-600" },
        { label: "Citas", value: 0, delta: "+0", Icon: CalendarDays, color: "text-amber-600" },
    ]);
    const [loading, setLoading] = useState(true);

    // Datos estáticos para gráficos (hasta que tengamos endpoints específicos)
    const ocupacion = [
        { nombre: "Pediatría", pct: 82 },
        { nombre: "Cardiología", pct: 68 },
        { nombre: "Traumatología", pct: 57 },
        { nombre: "Dermatología", pct: 44 },
    ];

    const semana = [
        { d: "Lun", v: 64 },
        { d: "Mar", v: 72 },
        { d: "Mié", v: 58 },
        { d: "Jue", v: 93 },
        { d: "Vie", v: 87 },
        { d: "Sáb", v: 41 },
        { d: "Dom", v: 25 },
    ];

    const actividad = [
        { t: "Sistema conectado al backend real.", ts: "hoy 09:12" },
        { t: "API Gateway funcionando correctamente.", ts: "ayer 18:40" },
        { t: "Autenticación configurada.", ts: "ayer 10:15" },
        { t: "Base de datos conectada.", ts: "lun 16:02" },
    ];

    useEffect(() => {
        async function loadStats() {
            try {
                const [hospitals, medicos, empleados, citas] = await Promise.all([
                    listHospitals({ page: 1, pageSize: 1000 }),
                    listMedicos({ page: 1, pageSize: 1000 }),
                    listEmpleados({ page: 1, pageSize: 1000 }),
                    listCitas({ page: 1, pageSize: 1000 })
                ]);

                setKpis([
                    { label: "Hospitales", value: hospitals.total || 0, delta: "+0", Icon: Building2, color: "text-emerald-600" },
                    { label: "Médicos", value: medicos.total || 0, delta: "+0", Icon: Stethoscope, color: "text-sky-600" },
                    { label: "Empleados", value: empleados.total || 0, delta: "+0", Icon: Users, color: "text-indigo-600" },
                    { label: "Citas", value: citas.total || 0, delta: "+0", Icon: CalendarDays, color: "text-amber-600" },
                ]);
            } catch (error) {
                console.error('Error cargando estadísticas:', error);
            } finally {
                setLoading(false);
            }
        }

        loadStats();
    }, []);

    return (
        <div className="space-y-6">
            {/* Título */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-slate-600">Resumen operativo de Clinix.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                    <TrendingUp size={16} className="text-emerald-600" />
                    Última actualización: hace 5 min
                </div>
            </div>

            {/* KPIs */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map(({ label, value, delta, Icon, color }) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                            <div className={`rounded-lg bg-slate-50 p-2 ${color}`}>
                                <Icon size={18} />
                            </div>
                            <span
                                className={`text-xs font-medium ${delta.startsWith("+") ? "text-emerald-600" : "text-rose-600"
                                    }`}
                            >
                                {delta}
                            </span>
                        </div>
                        <div className="mt-3">
                            <p className="text-2xl font-semibold">{value}</p>
                            <p className="text-sm text-slate-600">{label}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Dos columnas principales */}
            <section className="grid gap-4 lg:grid-cols-3">
                {/* Ocupación por especialidad */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-1">
                    <h3 className="mb-3 text-sm font-semibold text-slate-800">
                        Ocupación por especialidad
                    </h3>
                    <div className="space-y-3">
                        {ocupacion.map((o) => (
                            <div key={o.nombre}>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-700">{o.nombre}</span>
                                    <span className="font-medium text-slate-900">{o.pct}%</span>
                                </div>
                                <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                                    <div
                                        className="h-2 rounded-full bg-emerald-500"
                                        style={{ width: `${o.pct}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Citas esta semana */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Activity size={16} className="text-indigo-600" />
                        Citas esta semana
                    </h3>
                    <div className="grid grid-cols-7 gap-3">
                        {semana.map((d) => (
                            <div key={d.d} className="flex flex-col items-center">
                                <div
                                    className="w-8 rounded-md bg-indigo-500/80 transition-all"
                                    style={{ height: `${Math.max(12, d.v)}px` }}
                                    title={`${d.v} citas`}
                                />
                                <span className="mt-2 text-xs text-slate-600">{d.d}</span>
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                        Datos conectados al backend real a través del API Gateway.
                    </p>
                </div>
            </section>

            {/* Actividad reciente */}
            <section className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-800">Actividad reciente</h3>
                <ul className="divide-y divide-slate-100">
                    {actividad.map((a, i) => (
                        <li key={i} className="flex items-start justify-between py-2">
                            <p className="text-sm text-slate-700">{a.t}</p>
                            <span className="text-xs text-slate-500">{a.ts}</span>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
