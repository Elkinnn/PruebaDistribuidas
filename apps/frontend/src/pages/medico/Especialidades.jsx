// src/pages/medico/Especialidades.jsx
import { useMemo, useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import AdaptivePagination from "../../components/shared/AdaptivePagination";
import { getEspecialidadesMedico } from "../../api/especialidad.medico";

export default function Especialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalEspecialidades: 0,
    totalMedicos: 0,
    masPopular: '',
    medicosMasPopular: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar especialidades al montar el componente
  useEffect(() => {
    loadEspecialidades();
  }, []);

  async function loadEspecialidades() {
    try {
      setLoading(true);
      setError(null);
      const result = await getEspecialidadesMedico();
      
      if (result.success) {
        setEspecialidades(result.data);
        setEstadisticas(result.estadisticas);
      } else {
        setError('Error al cargar especialidades');
      }
    } catch (err) {
      console.error('Error loading especialidades:', err);
      setError('Error al cargar especialidades');
    } finally {
      setLoading(false);
    }
  }

  const totalEspecialidades = estadisticas.totalEspecialidades;
  const totalMedicos = estadisticas.totalMedicos;
  const masPopular = estadisticas.masPopular;

  /* ---------- Paginación (6 por página fijo) ---------- */
  const [page, setPage] = useState(1);
  const pageSize = 6; // ✅ ahora solo 6 especialidades por página
  const total = totalEspecialidades;

  const items = useMemo(() => {
    const start = (page - 1) * pageSize;
    return especialidades.slice(start, start + pageSize);
  }, [page, pageSize, especialidades]);

  if (loading) {
    return (
      <div className="space-y-6 relative">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Especialidades Médicas</h1>
          <p className="text-slate-600">
            Cargando especialidades disponibles en nuestro centro médico...
          </p>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 relative">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Especialidades Médicas</h1>
          <p className="text-slate-600">
            Error al cargar especialidades
          </p>
        </div>
        <Card className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={loadEspecialidades}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Especialidades Médicas</h1>
        <p className="text-slate-600">
          Especialidades disponibles en nuestro centro médico
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {totalEspecialidades}
              </div>
              <div className="text-sm text-slate-600">Activas en el sistema</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-xs font-medium text-slate-500">
            Total Especialidades
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">{totalMedicos}</div>
              <div className="text-sm text-slate-600">
                En todas las especialidades
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-xs font-medium text-slate-500">Total Médicos</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-slate-900">
                {masPopular || 'N/A'}
              </div>
              <div className="text-sm text-slate-600">
                {estadisticas.medicosMasPopular} médicos
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-xs font-medium text-slate-500">Más Popular</div>
        </Card>
      </div>

      {/* Grid de Especialidades (paginado 6 por página) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((especialidad) => (
          <Card
            key={especialidad.id}
            className="p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{especialidad.icono}</div>
              <div className="text-right">
                <div className="text-sm font-medium text-slate-600">
                  {especialidad.medicos} médicos
                </div>
                <Badge className="bg-green-50 text-green-700 ring-1 ring-green-200">
                  Activa
                </Badge>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {especialidad.nombre}
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed">
              {especialidad.descripcion}
            </p>
          </Card>
        ))}

        {items.length === 0 && (
          <Card className="p-6">
            <p className="text-slate-500 text-sm">
              No hay especialidades para mostrar.
            </p>
          </Card>
        )}
      </div>

      {/* ⬇️ Paginación adaptativa - Siempre abajo */}
      {total > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20">
          <div className="w-[calc(100%-16rem)] ml-auto pl-6 pr-6">
            <AdaptivePagination
              page={page}
              pageSize={pageSize}
              total={total}
              onChange={setPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
