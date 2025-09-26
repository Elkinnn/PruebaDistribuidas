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
      
      setDatosGraficas(data);
    } catch (err) {
      console.error('Error cargando datos de gráficas:', err);
      setError('Error al cargar los datos de las gráficas');
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
    labels: datosGraficas.citasPorDia.map(item => new Date(item.fecha).toLocaleDateString()),
    datasets: [
      {
        label: 'Citas por día',
        data: datosGraficas.citasPorDia.map(item => item.cantidad),
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
    labels: datosGraficas.especialidades.map(item => item.especialidad),
    datasets: [
      {
        data: datosGraficas.especialidades.map(item => item.cantidad),
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
  const hospitales = [...new Set(datosGraficas.pacientesPorHospital.map(item => item.hospital))];
  const estados = [...new Set(datosGraficas.pacientesPorHospital.map(item => item.estado))];
  
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
          const item = datosGraficas.pacientesPorHospital.find(
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
    labels: datosGraficas.medicosTop.map(item => item.medico),
    datasets: [
      {
        label: 'Citas atendidas',
        data: datosGraficas.medicosTop.map(item => item.citasAtendidas),
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
  const fechas = [...new Set(datosGraficas.estadosPorDia.map(item => item.fecha))];
  const datosEstadosPorDia = {
    labels: fechas.map(fecha => new Date(fecha).toLocaleDateString()),
    datasets: estados.map((estado) => {
      const colores = getEstadoColors(estado);
      return {
        label: estado,
        data: fechas.map(fecha => {
          const item = datosGraficas.estadosPorDia.find(
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
    labels: datosGraficas.empleadosPorHospital.map(item => item.hospital),
    datasets: [
      {
        data: datosGraficas.empleadosPorHospital.map(item => item.cantidadEmpleados),
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

  // Componente para mostrar cuando no hay datos
  const EmptyState = ({ icon, title, message, color = "blue" }) => (
    <div className="flex flex-col items-center justify-center h-80 text-center">
      <div className={`w-16 h-16 bg-${color}-100 rounded-full flex items-center justify-center mb-4`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm">{message}</p>
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
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Citas por Día</h3>
              <p className="text-sm text-slate-500">Tendencia temporal de volumen</p>
            </div>
          </div>
          <div className="h-80">
            {datosGraficas.citasPorDia.length > 0 ? (
              <Line data={datosCitasPorDia} options={chartOptions} />
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
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Distribución de Especialidades</h3>
              <p className="text-sm text-slate-500">Proporción de citas por especialidad</p>
            </div>
          </div>
          <div className="h-80">
            {datosGraficas.especialidades.length > 0 ? (
              <Pie data={datosEspecialidades} options={chartOptions} />
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
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Citas por Hospital</h3>
              <p className="text-sm text-slate-500">Distribución por estado y hospital</p>
            </div>
          </div>
          <div className="h-80">
            {datosGraficas.pacientesPorHospital.length > 0 ? (
              <Bar data={datosPacientesPorHospital} options={chartOptions} />
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
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mr-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Ranking de Médicos</h3>
              <p className="text-sm text-slate-500">Médicos con más citas atendidas</p>
            </div>
          </div>
          <div className="h-80">
            {datosGraficas.medicosTop.length > 0 ? (
              <Bar data={datosMedicosTop} options={opcionesMedicos} />
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
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Estados por Día</h3>
              <p className="text-sm text-slate-500">Distribución temporal de estados</p>
            </div>
          </div>
          <div className="h-80">
            {datosGraficas.estadosPorDia.length > 0 ? (
              <Bar data={datosEstadosPorDia} options={chartOptions} />
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
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Personal por Hospital</h3>
              <p className="text-sm text-slate-500">Distribución de empleados médicos</p>
            </div>
          </div>
          <div className="h-80">
            {datosGraficas.empleadosPorHospital.length > 0 ? (
              <Doughnut data={datosEmpleadosPorHospital} options={chartOptions} />
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
