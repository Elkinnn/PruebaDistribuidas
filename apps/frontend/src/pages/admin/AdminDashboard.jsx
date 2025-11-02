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
            
            const res = await getKpisDashboard(filtrosAplicar);
            const kpisData = res.data || res;
            const { degraded, _stale } = kpisData || {};
            
            setKpis(kpisData);
            
            // Mostrar advertencia si está degraded o stale
            if (degraded || _stale) {
                const message = _stale 
                    ? "Mostrando datos en caché (pueden estar desactualizados)"
                    : "Datos no disponibles temporalmente";
                setError(message);
            }
        } catch (err) {
            console.error('Error cargando KPIs:', err);
            
            // Manejar Circuit Breaker específicamente
            let errorMessage = 'Error al cargar los datos del dashboard';
            if (err.status === 503 || err.isCircuitOpen || err.response?.status === 503) {
                errorMessage = 'El servicio está temporalmente no disponible. Por favor, intenta nuevamente en unos momentos.';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
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
        <div className="space-y-8">
            {/* Header mejorado */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard Médico</h1>
                        <p className="text-emerald-100 mt-2">Métricas y análisis en tiempo real</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Datos en vivo</span>
                    </div>
                </div>
            </div>

            {/* Filtros mejorados */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-slate-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Filtros de Período</h3>
                    </div>
                    {(filtros.desde && filtros.hasta) && (
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">Filtros activos</span>
                        </div>
                    )}
                    {(filtros.desde || filtros.hasta) && !(filtros.desde && filtros.hasta) && (
                        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-lg">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span className="text-sm font-medium">Selecciona ambas fechas</span>
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

            {/* KPIs mejorados */}
            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {/* Total Citas */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                            <CalendarDays className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-blue-700">{kpis.totalCitas}</div>
                            <div className="text-sm text-blue-600 font-medium">Total Citas</div>
                        </div>
                    </div>
                    {filtros.desde && filtros.hasta && (
                        <div className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
                            {filtros.desde} - {filtros.hasta}
                        </div>
                    )}
                </div>

                {/* % Canceladas */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200 p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                            <XCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-red-700">{kpis.porcentajeCanceladas}%</div>
                            <div className="text-sm text-red-600 font-medium">Canceladas</div>
                        </div>
                    </div>
                    <div className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                        {kpis.canceladas} de {kpis.totalCitas} citas
                    </div>
                </div>

                {/* % Atendidas */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-emerald-700">{kpis.porcentajeAtendidas}%</div>
                            <div className="text-sm text-emerald-600 font-medium">Atendidas</div>
                        </div>
                    </div>
                    <div className="text-xs text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                        {kpis.atendidas} de {kpis.totalCitas} citas
                    </div>
                </div>

                {/* % Programadas */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border border-indigo-200 p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-indigo-700">{kpis.porcentajeProgramadas}%</div>
                            <div className="text-sm text-indigo-600 font-medium">Programadas</div>
                        </div>
                    </div>
                    <div className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">
                        {kpis.programadas} de {kpis.totalCitas} citas
                    </div>
                </div>

                {/* Tiempo Medio */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl border border-amber-200 p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-amber-700">{kpis.tiempoMedioConsulta}</div>
                            <div className="text-sm text-amber-600 font-medium">Minutos</div>
                        </div>
                    </div>
                    <div className="text-xs text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
                        Tiempo medio de consulta
                    </div>
                </div>
            </section>


                    {/* Gráficas */}
                    <Graficas filtros={filtros} />

                    {/* Reportes */}
                    <Reportes filtros={filtros} />
                </div>
            );
        }
