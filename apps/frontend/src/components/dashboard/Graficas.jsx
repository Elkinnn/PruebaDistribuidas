import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { getGraficasData } from "../../api/cita";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Graficas({ filtros }) {
  const [datosGraficas, setDatosGraficas] = useState({
    citasPorDia: [],
    especialidades: [],
    pacientesPorHospital: [],
    medicosTop: [],
    estadosPorDia: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatosGraficas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getGraficasData({
        desde: filtros.desde || undefined,
        hasta: filtros.hasta || undefined
      });
      
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

  // Configuración común para las gráficas
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // 1. Gráfica de líneas: Citas por día
  const datosCitasPorDia = {
    labels: datosGraficas.citasPorDia.map(item => new Date(item.fecha).toLocaleDateString()),
    datasets: [
      {
        label: 'Citas por día',
        data: datosGraficas.citasPorDia.map(item => item.cantidad),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // 2. Gráfica de barras: Top especialidades
  const datosEspecialidades = {
    labels: datosGraficas.especialidades.map(item => item.especialidad),
    datasets: [
      {
        label: 'Número de citas',
        data: datosGraficas.especialidades.map(item => item.cantidad),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 101, 101, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(147, 51, 234)',
          'rgb(236, 72, 153)',
          'rgb(14, 165, 233)',
          'rgb(16, 185, 129)',
          'rgb(245, 101, 101)',
          'rgb(168, 85, 247)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // 3. Gráfica de barras apiladas: Pacientes por hospital
  const hospitales = [...new Set(datosGraficas.pacientesPorHospital.map(item => item.hospital))];
  const estados = [...new Set(datosGraficas.pacientesPorHospital.map(item => item.estado))];
  
  const datosPacientesPorHospital = {
    labels: hospitales,
    datasets: estados.map((estado, index) => ({
      label: estado,
      data: hospitales.map(hospital => {
        const item = datosGraficas.pacientesPorHospital.find(
          p => p.hospital === hospital && p.estado === estado
        );
        return item ? item.cantidad : 0;
      }),
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
      ][index % 3],
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(34, 197, 94)',
        'rgb(59, 130, 246)',
      ][index % 3],
      borderWidth: 1,
    })),
  };

  // 4. Gráfica de barras horizontales: Top médicos
  const datosMedicosTop = {
    labels: datosGraficas.medicosTop.map(item => item.medico),
    datasets: [
      {
        label: 'Citas atendidas',
        data: datosGraficas.medicosTop.map(item => item.citasAtendidas),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  const opcionesMedicos = {
    ...chartOptions,
    indexAxis: 'y',
  };

  // 5. Gráfica recomendada: Distribución de estados por día
  const fechas = [...new Set(datosGraficas.estadosPorDia.map(item => item.fecha))];
  const datosEstadosPorDia = {
    labels: fechas.map(fecha => new Date(fecha).toLocaleDateString()),
    datasets: estados.map((estado, index) => ({
      label: estado,
      data: fechas.map(fecha => {
        const item = datosGraficas.estadosPorDia.find(
          e => e.fecha === fecha && e.estado === estado
        );
        return item ? item.cantidad : 0;
      }),
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
      ][index % 3],
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(34, 197, 94)',
        'rgb(59, 130, 246)',
      ][index % 3],
      borderWidth: 1,
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-2">Gráficas de Análisis</h2>
        <p className="text-slate-600">Visualización de datos de citas médicas basados en información real.</p>
      </div>

      {/* Gráficas en grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 1. Citas por día */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Citas por Día</h3>
          <div className="h-64">
            <Line data={datosCitasPorDia} options={chartOptions} />
          </div>
        </div>

        {/* 2. Top especialidades */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Top 10 Especialidades</h3>
          <div className="h-64">
            <Bar data={datosEspecialidades} options={chartOptions} />
          </div>
        </div>

        {/* 3. Pacientes por hospital */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Citas por Hospital y Estado</h3>
          <div className="h-64">
            <Bar data={datosPacientesPorHospital} options={chartOptions} />
          </div>
        </div>

        {/* 4. Top médicos */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Top Médicos por Citas Atendidas</h3>
          <div className="h-64">
            <Bar data={datosMedicosTop} options={opcionesMedicos} />
          </div>
        </div>
      </div>

      {/* Gráfica recomendada: Estados por día */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Distribución de Estados por Día</h3>
        <p className="text-sm text-slate-600 mb-4">
          Esta gráfica muestra cómo se distribuyen los diferentes estados de citas a lo largo del tiempo, 
          permitiendo identificar patrones y tendencias.
        </p>
        <div className="h-64">
          <Bar data={datosEstadosPorDia} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
