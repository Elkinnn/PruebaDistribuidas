// src/pages/admin/Especialidades.jsx
import { useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/shared/Pagination";

export default function Especialidades() {
  // Datos de prueba de especialidades
  const especialidades = [
    {
      id: 1,
      nombre: "Cardiología",
      medicos: 12,
      descripcion:
        "Especialidad médica que se encarga del estudio, diagnóstico y tratamiento de las enfermedades del corazón y del aparato circulatorio.",
      icono: "❤️",
      activa: true,
    },
    {
      id: 2,
      nombre: "Neurología",
      medicos: 8,
      descripcion:
        "Especialidad médica que trata los trastornos del sistema nervioso central, periférico y autónomo.",
      icono: "🧠",
      activa: true,
    },
    {
      id: 3,
      nombre: "Oftalmología",
      medicos: 6,
      descripcion:
        "Especialidad médica que estudia las enfermedades de los ojos y su tratamiento, incluyendo el globo ocular y sus anexos.",
      icono: "👁️",
      activa: true,
    },
    {
      id: 4,
      nombre: "Traumatología",
      medicos: 15,
      descripcion:
        "Especialidad médica que se dedica al estudio de las lesiones del aparato locomotor.",
      icono: "🦴",
      activa: true,
    },
    {
      id: 5,
      nombre: "Pediatría",
      medicos: 10,
      descripcion:
        "Especialidad médica que estudia al niño y sus enfermedades desde el nacimiento hasta la adolescencia.",
      icono: "👶",
      activa: true,
    },
    {
      id: 6,
      nombre: "Medicina General",
      medicos: 20,
      descripcion:
        "Atención médica integral y continua para individuos, familias y comunidades.",
      icono: "🩺",
      activa: true,
    },
    {
      id: 7,
      nombre: "Dermatología",
      medicos: 9,
      descripcion:
        "Especialidad médica que se ocupa del estudio de la piel, su estructura, función y enfermedades.",
      icono: "🧴",
      activa: true,
    },
    {
      id: 8,
      nombre: "Ginecología",
      medicos: 11,
      descripcion:
        "Especialidad médica dedicada al cuidado del sistema reproductor femenino y sus patologías.",
      icono: "🌸",
      activa: true,
    },
  ];

  const totalEspecialidades = especialidades.length;
  const totalMedicos = especialidades.reduce((sum, esp) => sum + esp.medicos, 0);
  const masPopular = especialidades.reduce((prev, current) =>
    prev.medicos > current.medicos ? prev : current
  );

  /* ---------- Paginación (6 por página fijo) ---------- */
  const [page, setPage] = useState(1);
  const pageSize = 6; // ✅ ahora solo 6 especialidades por página
  const total = totalEspecialidades;

  const items = useMemo(() => {
    const start = (page - 1) * pageSize;
    return especialidades.slice(start, start + pageSize);
  }, [page, pageSize, especialidades]);

  return (
    <div className="space-y-6 relative">
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
                {masPopular.nombre}
              </div>
              <div className="text-sm text-slate-600">
                {masPopular.medicos} médicos
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

      {/* ⬇️ Paginación SIEMPRE abajo */}
      {total > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-20">
          <div className="w-[calc(100%-16rem)] ml-auto px-6 py-3 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-t-lg shadow">
            <Pagination
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
