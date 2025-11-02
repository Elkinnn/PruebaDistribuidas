import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import { BarChart3, PieChart, Building2, Users, TrendingUp, Activity } from "lucide-react";
import { getGraficasData } from "../../api/cita";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Graficas({ filtros }) {
  const [datosGraficas, setDatosGraficas] = useState({
    citasPorDia: [],
    especialidades: [],
    pacientesPorHospital: [],
    medicosTop: [],
    estadosPorDia: [],
    empleadosPorHospital: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatosGraficas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Solo aplicar filtros si ambos campos están llenos
      const filtrosAplicar = (filtros.desde && filtros.hasta) 
        ? { desde: filtros.desde, hasta: filtros.hasta }
        : {};
      
      const data = await getGraficasData(filtrosAplicar);
      
      // Asegurar que todos los campos sean arrays válidos
      setDatosGraficas({
        citasPorDia: Array.isArray(data?.citasPorDia) ? data.citasPorDia : [],
        especialidades: Array.isArray(data?.especialidades) ? data.especialidades : [],
        pacientesPorHospital: Array.isArray(data?.pacientesPorHospital) ? data.pacientesPorHospital : [],
        medicosTop: Array.isArray(data?.medicosTop) ? data.medicosTop : [],
        estadosPorDia: Array.isArray(data?.estadosPorDia) ? data.estadosPorDia : [],
        empleadosPorHospital: Array.isArray(data?.empleadosPorHospital) ? data.empleadosPorHospital : []
      });
    } catch (err) {
      console.error('Error cargando datos de gráficas:', err);
      
      // Mantener arrays vacíos en caso de error para evitar errores de .map()
      setDatosGraficas({
        citasPorDia: [],
        especialidades: [],
        pacientesPorHospital: [],
        medicosTop: [],
        estadosPorDia: [],
        empleadosPorHospital: []
      });
      
      // Manejar Circuit Breaker específicamente
      let errorMessage = 'Error al cargar los datos de las gráficas';
      if (err.status === 503 || err.isCircuitOpen || err.response?.status === 503 || err.normalized?.status === 503) {
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
    cargarDatosGraficas();
  }, [filtros.desde, filtros.hasta]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando gráficas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  // Configuración común para las gráficas - Diseño profesional
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            weight: '500'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11,
            weight: '500'
          }
        }
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6
      },
      line: {
        tension: 0.4,
        borderWidth: 3
      }
    }
  };

  // 1. Gráfica de líneas: Citas por día
  const datosCitasPorDia = {
    labels: (datosGraficas.citasPorDia || []).map(item => new Date(item.fecha).toLocaleDateString()),
    datasets: [
      {
        label: 'Citas por día',
        data: (datosGraficas.citasPorDia || []).map(item => item.cantidad),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // 2. Gráfica de pastel: Top especialidades
  const datosEspecialidades = {
    labels: (datosGraficas.especialidades || []).map(item => item.especialidad),
    datasets: [
      {
        data: (datosGraficas.especialidades || []).map(item => item.cantidad),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 101, 101, 0.8)',
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(34, 197, 94)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(147, 51, 234)',
          'rgb(14, 165, 233)',
          'rgb(236, 72, 153)',
          'rgb(16, 185, 129)',
          'rgb(168, 85, 247)',
          'rgb(245, 101, 101)',
        ],
        borderWidth: 3,
        hoverOffset: 10,
      },
    ],
  };

  // 3. Gráfica de barras apiladas: Pacientes por hospital
  const pacientesPorHospital = datosGraficas.pacientesPorHospital || [];
  const hospitales = [...new Set(pacientesPorHospital.map(item => item.hospital))];
  const estados = [...new Set(pacientesPorHospital.map(item => item.estado))];
  
  // Función para obtener colores según el estado
  const getEstadoColors = (estado) => {
    const colores = {
      'ATENDIDA': { bg: 'rgba(34, 197, 94, 0.8)', border: 'rgb(34, 197, 94)' }, // Verde
      'CANCELADA': { bg: 'rgba(239, 68, 68, 0.8)', border: 'rgb(239, 68, 68)' }, // Rojo
      'PROGRAMADA': { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgb(59, 130, 246)' }, // Azul
    };
    return colores[estado] || { bg: 'rgba(156, 163, 175, 0.8)', border: 'rgb(156, 163, 175)' };
  };
  
  const datosPacientesPorHospital = {
    labels: hospitales,
    datasets: estados.map((estado) => {
      const colores = getEstadoColors(estado);
      return {
        label: estado,
        data: hospitales.map(hospital => {
          const item = pacientesPorHospital.find(
            p => p.hospital === hospital && p.estado === estado
          );
          return item ? item.cantidad : 0;
        }),
        backgroundColor: colores.bg,
        borderColor: colores.border,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      };
    }),
  };

  // 4. Gráfica de barras horizontales: Top médicos
  const datosMedicosTop = {
    labels: (datosGraficas.medicosTop || []).map(item => item.medico),
    datasets: [
      {
        label: 'Citas atendidas',
        data: (datosGraficas.medicosTop || []).map(item => item.citasAtendidas),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(147, 51, 234, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(147, 51, 234)',
        ],
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const opcionesMedicos = {
    ...chartOptions,
    indexAxis: 'y',
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        display: false // Ocultar leyenda para barras horizontales
      }
    },
    scales: {
      x: {
        ...chartOptions.scales.x,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        }
      },
      y: {
        ...chartOptions.scales.y,
        grid: {
          display: false
        }
      }
    }
  };

  // 5. Gráfica recomendada: Distribución de estados por día
  const estadosPorDia = datosGraficas.estadosPorDia || [];
  const fechas = [...new Set(estadosPorDia.map(item => item.fecha))];
  const datosEstadosPorDia = {
    labels: fechas.map(fecha => new Date(fecha).toLocaleDateString()),
    datasets: estados.map((estado) => {
      const colores = getEstadoColors(estado);
      return {
        label: estado,
        data: fechas.map(fecha => {
          const item = estadosPorDia.find(
            e => e.fecha === fecha && e.estado === estado
          );
          return item ? item.cantidad : 0;
        }),
        backgroundColor: colores.bg,
        borderColor: colores.border,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      };
    }),
  };

  // 6. Gráfica de donut: Empleados por hospital
  const datosEmpleadosPorHospital = {
    labels: (datosGraficas.empleadosPorHospital || []).map(item => item.hospital),
    datasets: [
      {
        data: (datosGraficas.empleadosPorHospital || []).map(item => item.cantidadEmpleados),
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: [
          'rgb(147, 51, 234)',
          'rgb(99, 102, 241)',
          'rgb(59, 130, 246)',
          'rgb(14, 165, 233)',
          'rgb(16, 185, 129)',
        ],
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  // Componente mejorado para mostrar cuando no hay datos
  const EmptyState = ({ icon, title, message, color = "blue" }) => (
    <div className="flex flex-col items-center justify-center h-80 text-center p-8">
      <div className={`w-20 h-20 bg-gradient-to-br from-${color}-100 to-${color}-200 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
        <div className="text-3xl">{icon}</div>
      </div>
      <h3 className="text-xl font-bold text-slate-700 mb-3">{title}</h3>
      <p className="text-slate-500 max-w-sm leading-relaxed">{message}</p>
      <div className="mt-4 px-4 py-2 bg-slate-100 rounded-lg">
        <p className="text-xs text-slate-500">Selecciona un rango de fechas para ver los datos</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header con diseño profesional */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Análisis Visual de Datos
          </h2>
        </div>
        <p className="text-slate-600 text-lg">Visualización interactiva de datos de citas médicas en tiempo real</p>
      </div>

      {/* Primera fila de gráficas */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* 1. Citas por día */}
        <div className="group bg-white rounded-2xl shadow-xl border border-slate-100 p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 hover:border-blue-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors duration-300">Citas por Día</h3>
                <p className="text-sm text-slate-500">Tendencia temporal de volumen</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">Tiempo real</span>
            </div>
          </div>
          <div className="h-80 relative">
            {datosGraficas.citasPorDia.length > 0 ? (
              <div className="h-full w-full">
                <Line data={datosCitasPorDia} options={chartOptions} />
              </div>
            ) : (
              <EmptyState 
                icon="📈" 
                title="Sin datos temporales" 
                message="No hay citas registradas en el período seleccionado para mostrar la tendencia temporal."
                color="blue"
              />
            )}
          </div>
        </div>

        {/* 2. Top especialidades */}
        <div className="group bg-white rounded-2xl shadow-xl border border-slate-100 p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 hover:border-emerald-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <PieChart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors duration-300">Distribución de Especialidades</h3>
                <p className="text-sm text-slate-500">Proporción de citas por especialidad</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">Interactivo</span>
            </div>
          </div>
          <div className="h-80 relative">
            {datosGraficas.especialidades.length > 0 ? (
              <div className="h-full w-full">
                <Pie data={datosEspecialidades} options={chartOptions} />
              </div>
            ) : (
              <EmptyState 
                icon="🥧" 
                title="Sin especialidades" 
                message="No hay citas registradas con especialidades para mostrar la distribución."
                color="emerald"
              />
            )}
          </div>
        </div>
      </div>

      {/* Segunda fila de gráficas */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* 3. Pacientes por hospital */}
        <div className="group bg-white rounded-2xl shadow-xl border border-slate-100 p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 hover:border-purple-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-purple-700 transition-colors duration-300">Citas por Hospital</h3>
                <p className="text-sm text-slate-500">Distribución por estado y hospital</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">Comparativo</span>
            </div>
          </div>
          <div className="h-80 relative">
            {datosGraficas.pacientesPorHospital.length > 0 ? (
              <div className="h-full w-full">
                <Bar data={datosPacientesPorHospital} options={chartOptions} />
              </div>
            ) : (
              <EmptyState 
                icon="🏢" 
                title="Sin datos de hospitales" 
                message="No hay citas registradas por hospital para mostrar la distribución por estados."
                color="purple"
              />
            )}
          </div>
        </div>

        {/* 4. Top médicos */}
        <div className="group bg-white rounded-2xl shadow-xl border border-slate-100 p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 hover:border-amber-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-amber-700 transition-colors duration-300">Ranking de Médicos</h3>
                <p className="text-sm text-slate-500">Médicos con más citas atendidas</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-lg">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">Top 5</span>
            </div>
          </div>
          <div className="h-80 relative">
            {datosGraficas.medicosTop.length > 0 ? (
              <div className="h-full w-full">
                <Bar data={datosMedicosTop} options={opcionesMedicos} />
              </div>
            ) : (
              <EmptyState 
                icon="📊" 
                title="Sin médicos con citas" 
                message="No hay médicos con citas atendidas para mostrar el ranking de rendimiento."
                color="amber"
              />
            )}
          </div>
        </div>
      </div>

      {/* Tercera fila: Gráficas especiales */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* 5. Estados por día */}
        <div className="group bg-white rounded-2xl shadow-xl border border-slate-100 p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 hover:border-indigo-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-700 transition-colors duration-300">Estados por Día</h3>
                <p className="text-sm text-slate-500">Distribución temporal de estados</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">Temporal</span>
            </div>
          </div>
          <div className="h-80 relative">
            {datosGraficas.estadosPorDia.length > 0 ? (
              <div className="h-full w-full">
                <Bar data={datosEstadosPorDia} options={chartOptions} />
              </div>
            ) : (
              <EmptyState 
                icon="📊" 
                title="Sin datos de estados" 
                message="No hay datos de distribución de estados por día para mostrar las tendencias."
                color="indigo"
              />
            )}
          </div>
        </div>

        {/* 6. Empleados por hospital */}
        <div className="group bg-white rounded-2xl shadow-xl border border-slate-100 p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 hover:border-pink-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-pink-700 transition-colors duration-300">Personal por Hospital</h3>
                <p className="text-sm text-slate-500">Distribución de empleados médicos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1 rounded-lg">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">Personal</span>
            </div>
          </div>
          <div className="h-80 relative">
            {datosGraficas.empleadosPorHospital.length > 0 ? (
              <div className="h-full w-full">
                <Doughnut data={datosEmpleadosPorHospital} options={chartOptions} />
              </div>
            ) : (
              <EmptyState 
                icon="🍩" 
                title="Sin empleados registrados" 
                message="No hay empleados registrados por hospital para mostrar la distribución del personal."
                color="pink"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
