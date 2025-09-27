import { useState } from "react";
import { Download, FileText, Users, Activity, Calendar, CheckCircle, AlertCircle, Clock } from "lucide-react";

export default function Reportes({ filtros }) {
  const [tipoReporte, setTipoReporte] = useState("");
  const [descargando, setDescargando] = useState(false);

  const tiposReporte = [
    {
      id: "citas-detalladas",
      titulo: "Citas detalladas (rango)",
      descripcion: "Exportación completa de todas las citas entre dos fechas",
      icono: <FileText className="w-5 h-5" />,
      detalles: [
        "ID, hospital, médico, paciente, especialidad",
        "Fecha/hora inicio-fin, estado",
        "Quién creó la cita"
      ],
      proposito: "Auditorías, revisar historial, control administrativo"
    },
    {
      id: "resumen-especialidad",
      titulo: "Resumen por especialidad (rango)",
      descripcion: "Reporte agregado que agrupa por especialidad",
      icono: <Activity className="w-5 h-5" />,
      detalles: [
        "Especialidad y total de citas",
        "Atendidas, canceladas, programadas",
        "% cancelación y % atención"
      ],
      proposito: "Ver demanda real por especialidad, decisiones de contratación"
    },
    {
      id: "productividad-medico",
      titulo: "Productividad por médico (rango)",
      descripcion: "Reporte individualizado por cada médico",
      icono: <Users className="w-5 h-5" />,
      detalles: [
        "Nombre del médico y especialidades",
        "Número total de citas",
        "% atendidas, % canceladas, promedio de duración"
      ],
      proposito: "Medir desempeño, detectar alta demanda, ver patrones"
    }
  ];

  const handleDescargar = async () => {
    if (!tipoReporte) {
      alert("Por favor selecciona un tipo de reporte");
      return;
    }

    if (!filtros.desde || !filtros.hasta) {
      alert("Por favor selecciona un rango de fechas para generar el reporte");
      return;
    }

    try {
      setDescargando(true);
      
      // Llamar al endpoint de reportes
      const response = await fetch(`http://localhost:3000/citas/reportes/${tipoReporte}?desde=${filtros.desde}&hasta=${filtros.hasta}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        }
      });

      if (response.ok) {
        // Verificar que el Content-Type sea PDF
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/pdf')) {
          throw new Error('Respuesta no es un PDF válido');
        }

        // Obtener el blob correctamente
        const blob = await response.blob();
        
        // Verificar que el blob tenga contenido
        if (blob.size === 0) {
          throw new Error('El PDF está vacío');
        }

        // Crear URL del blob y descargar
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-${tipoReporte}-${filtros.desde}-${filtros.hasta}.pdf`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // Limpiar
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
      } else {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`Error del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error('Error descargando reporte:', error);
      alert(`Error al descargar el reporte: ${error.message}`);
    } finally {
      setDescargando(false);
    }
  };

  const reporteSeleccionado = tiposReporte.find(r => r.id === tipoReporte);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Generación de Reportes
          </h2>
        </div>
        <p className="text-slate-600 text-lg">Descarga reportes detallados en formato PDF basados en tus filtros de fecha</p>
      </div>

      {/* Selector de tipo de reporte mejorado */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Selecciona el tipo de reporte</h3>
        </div>
        
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {tiposReporte.map((reporte) => (
            <div
              key={reporte.id}
              onClick={() => setTipoReporte(reporte.id)}
              className={`cursor-pointer group p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                tipoReporte === reporte.id
                  ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg ring-2 ring-emerald-200'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md bg-white'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-xl transition-all duration-300 ${
                  tipoReporte === reporte.id 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                }`}>
                  {reporte.icono}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-slate-800 text-lg">{reporte.titulo}</h4>
                    {tipoReporte === reporte.id && (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">{reporte.descripcion}</p>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">📋 Incluye:</p>
                    <div className="space-y-1">
                      {reporte.detalles.map((detalle, index) => (
                        <p key={index} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="text-emerald-500 mt-1">•</span>
                          {detalle}
                        </p>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">🎯 Para:</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{reporte.proposito}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel de descarga mejorado */}
      {tipoReporte && (
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-xl border border-emerald-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-emerald-500 text-white rounded-xl shadow-lg">
                {reporteSeleccionado.icono}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{reporteSeleccionado.titulo}</h3>
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Reporte configurado y listo
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {(!filtros.desde || !filtros.hasta) ? (
                <div className="flex items-center gap-3 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-200">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Selecciona ambas fechas para filtrar</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-200">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Filtros configurados</span>
                </div>
              )}
              
              <button
                onClick={handleDescargar}
                disabled={descargando || !filtros.desde || !filtros.hasta}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  descargando || !filtros.desde || !filtros.hasta
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                }`}
              >
                {descargando ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generando PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Descargar PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Información del período */}
          {filtros.desde && filtros.hasta && (
            <div className="bg-white rounded-xl p-6 border border-emerald-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800">Período de Reporte</h4>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Desde</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {new Date(filtros.desde).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Hasta</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {new Date(filtros.hasta).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-800">Información del Reporte</span>
                </div>
                <p className="text-sm text-emerald-700">
                  El reporte incluirá todos los datos del período seleccionado con formato profesional y 
                  gráficos estadísticos según el tipo de reporte elegido.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
