import { useEffect, useState } from "react";
import {
    CalendarDays,
    XCircle,
    CheckCircle,
    Clock,
    Calendar,
} from "lucide-react";
import { getKpisDashboard } from "../../api/cita";
import Graficas from "../../components/dashboard/Graficas";
import Reportes from "../../components/dashboard/Reportes";

export default function AdminDashboard() {
  const [kpis, setKpis] = useState({
    totalCitas: 0,
    canceladas: 0,
    atendidas: 0,
    programadas: 0,
    porcentajeCanceladas: 0,
    porcentajeAtendidas: 0,
    porcentajeProgramadas: 0,
    tiempoMedioConsulta: 0
  });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState({
        desde: '',
        hasta: ''
    });

    const cargarKpis = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Solo aplicar filtros si ambos campos están llenos
            const filtrosAplicar = (filtros.desde && filtros.hasta) 
                ? { desde: filtros.desde, hasta: filtros.hasta }
                : {};
            
            const kpisData = await getKpisDashboard(filtrosAplicar);
            
            setKpis(kpisData);
        } catch (err) {
            console.error('Error cargando KPIs:', err);
            setError('Error al cargar los datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarKpis();
    }, [filtros.desde, filtros.hasta]);

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => {
            const nuevosFiltros = {
                ...prev,
                [campo]: valor
            };
            
            // Validación: fecha de fin no puede ser menor que fecha de inicio
            if (campo === 'desde' && nuevosFiltros.hasta && valor > nuevosFiltros.hasta) {
                nuevosFiltros.hasta = '';
            }
            if (campo === 'hasta' && nuevosFiltros.desde && valor < nuevosFiltros.desde) {
                // Si la fecha de fin es menor que la de inicio, la ajustamos
                return prev; // No actualizar si es inválida
            }
            
            return nuevosFiltros;
        });
    };

    const limpiarFiltros = () => {
        setFiltros({ desde: '', hasta: '' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Cargando datos del dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Título */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-slate-600">KPIs de citas médicas basados en datos reales.</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-800">Filtros de fecha</h3>
                    {(filtros.desde && filtros.hasta) && (
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 font-medium">Filtros activos</span>
                        </div>
                    )}
                    {(filtros.desde || filtros.hasta) && !(filtros.desde && filtros.hasta) && (
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-xs text-yellow-600 font-medium">Selecciona ambas fechas para filtrar</span>
                        </div>
                    )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Desde
                                </label>
                                <input
                                    type="date"
                                    value={filtros.desde}
                                    onChange={(e) => handleFiltroChange('desde', e.target.value)}
                                    max={filtros.hasta || undefined}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                />
                                {filtros.desde && filtros.hasta && filtros.desde > filtros.hasta && (
                                    <p className="text-xs text-red-600 mt-1">La fecha de inicio no puede ser mayor que la de fin</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Hasta
                                </label>
                                <input
                                    type="date"
                                    value={filtros.hasta}
                                    onChange={(e) => handleFiltroChange('hasta', e.target.value)}
                                    min={filtros.desde || undefined}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                />
                                {filtros.desde && filtros.hasta && filtros.hasta < filtros.desde && (
                                    <p className="text-xs text-red-600 mt-1">La fecha de fin no puede ser menor que la de inicio</p>
                                )}
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={limpiarFiltros}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200"
                                    style={{
                                        backgroundColor: 'oklch(0.596 0.145 163.225)',
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = 'oklch(0.55 0.145 163.225)'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'oklch(0.596 0.145 163.225)'}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Limpiar filtros
                                </button>
                            </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <XCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}

                    {/* KPIs */}
                    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {/* Total Citas */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <div className="rounded-lg bg-slate-50 p-2 text-indigo-600">
                                    <CalendarDays size={18} />
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-2xl font-semibold">{kpis.totalCitas}</p>
                                <p className="text-sm text-slate-600">Total Citas</p>
                                {filtros.desde && filtros.hasta && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        {filtros.desde} - {filtros.hasta}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* % Canceladas */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <div className="rounded-lg bg-slate-50 p-2 text-red-600">
                                    <XCircle size={18} />
                                </div>
                                <span className="text-xs font-medium text-red-600">
                                    {kpis.canceladas} de {kpis.totalCitas}
                                </span>
                            </div>
                            <div className="mt-3">
                                <p className="text-2xl font-semibold">{kpis.porcentajeCanceladas}%</p>
                                <p className="text-sm text-slate-600">% Canceladas</p>
                            </div>
                        </div>

                        {/* % Atendidas */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <div className="rounded-lg bg-slate-50 p-2 text-emerald-600">
                                    <CheckCircle size={18} />
                                </div>
                                <span className="text-xs font-medium text-emerald-600">
                                    {kpis.atendidas} de {kpis.totalCitas}
                                </span>
                            </div>
                            <div className="mt-3">
                                <p className="text-2xl font-semibold">{kpis.porcentajeAtendidas}%</p>
                                <p className="text-sm text-slate-600">% Atendidas</p>
                            </div>
                        </div>

                        {/* % Programadas */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <div className="rounded-lg bg-slate-50 p-2 text-blue-600">
                                    <Calendar size={18} />
                                </div>
                                <span className="text-xs font-medium text-blue-600">
                                    {kpis.programadas} de {kpis.totalCitas}
                                </span>
                            </div>
                            <div className="mt-3">
                                <p className="text-2xl font-semibold">{kpis.porcentajeProgramadas}%</p>
                                <p className="text-sm text-slate-600">% Programadas</p>
                            </div>
                        </div>

                        {/* Tiempo Medio */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <div className="rounded-lg bg-slate-50 p-2 text-amber-600">
                                    <Clock size={18} />
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-2xl font-semibold">{kpis.tiempoMedioConsulta}</p>
                                <p className="text-sm text-slate-600">Tiempo medio (min)</p>
                                <p className="text-xs text-slate-500 mt-1">Solo citas atendidas</p>
                            </div>
                        </div>
                    </section>

                    {/* Información adicional */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <Clock className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-800">
                                    <strong>Nota:</strong> Los datos mostrados son en tiempo real desde la base de datos. 
                                    El tiempo medio de consulta se calcula usando fechaInicio → fechaFin para citas con estado 'ATENDIDA'.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Gráficas */}
                    <Graficas filtros={filtros} />

                    {/* Reportes */}
                    <Reportes filtros={filtros} />
                </div>
            );
        }
