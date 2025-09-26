import { useState } from "react";
import { Download, FileText, Users, Activity } from "lucide-react";

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

      {/* Selector de tipo de reporte */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Selecciona el tipo de reporte</h3>
        
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          {tiposReporte.map((reporte) => (
            <div
              key={reporte.id}
              onClick={() => setTipoReporte(reporte.id)}
              className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 ${
                tipoReporte === reporte.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  tipoReporte === reporte.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {reporte.icono}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 mb-2">{reporte.titulo}</h4>
                  <p className="text-sm text-slate-600 mb-3">{reporte.descripcion}</p>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Incluye:</p>
                    {reporte.detalles.map((detalle, index) => (
                      <p key={index} className="text-xs text-slate-600">• {detalle}</p>
                    ))}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Para:</p>
                    <p className="text-xs text-slate-600">{reporte.proposito}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel de descarga */}
      {tipoReporte && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 text-white rounded-lg">
                {reporteSeleccionado.icono}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{reporteSeleccionado.titulo}</h3>
                <p className="text-sm text-slate-600">Listo para descargar</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {(!filtros.desde || !filtros.hasta) && (
                <div className="flex items-center gap-2 text-amber-600">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-sm font-medium">Selecciona ambas fechas para filtrar</span>
                </div>
              )}
              
              <button
                onClick={handleDescargar}
                disabled={descargando || !filtros.desde || !filtros.hasta}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
              >
                {descargando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </>
                )}
              </button>
            </div>
          </div>
          
          {filtros.desde && filtros.hasta && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">
                <strong>Período seleccionado:</strong> {new Date(filtros.desde).toLocaleDateString()} - {new Date(filtros.hasta).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
