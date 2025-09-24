import { Pencil, Trash2, Calendar, User, Stethoscope, Building2 } from "lucide-react";

export default function CitaTable({ items = [], onEdit, onDelete }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PROGRAMADA':
        return 'bg-blue-50 text-blue-700 ring-blue-200';
      case 'ATENDIDA':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
      case 'CANCELADA':
        return 'bg-red-50 text-red-700 ring-red-200';
      default:
        return 'bg-slate-100 text-slate-600 ring-slate-300';
    }
  };

  const getEstadoText = (estado) => {
    switch (estado) {
      case 'PROGRAMADA':
        return 'Programada';
      case 'ATENDIDA':
        return 'Atendida';
      case 'CANCELADA':
        return 'Cancelada';
      default:
        return estado;
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
        <colgroup>
          <col className="w-[20%]" />
          <col className="w-[15%]" />
          <col className="w-[15%]" />
          <col className="w-[20%]" />
          <col className="w-[15%]" />
          <col className="w-[15%]" />
        </colgroup>

        <thead>
          <tr className="bg-slate-50 text-left text-slate-700">
            <th className="px-4 py-3 font-semibold">Paciente</th>
            <th className="px-4 py-3 font-semibold">Médico</th>
            <th className="px-4 py-3 font-semibold">Hospital</th>
            <th className="px-4 py-3 font-semibold">Fecha</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 text-right font-semibold">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 text-slate-800">
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                No hay citas.
              </td>
            </tr>
          ) : (
            items.map((cita, i) => (
              <tr key={cita.id ?? i} className={i % 2 ? "bg-white" : "bg-slate-50/40"}>
                {/* Paciente */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-slate-400" />
                    <div>
                      <div className="font-semibold truncate" title={cita.pacienteNombre || 'Sin nombre'}>
                        {cita.pacienteNombre || 'Sin nombre'}
                      </div>
                      {cita.pacienteTelefono && (
                        <div className="text-xs text-slate-500 truncate" title={cita.pacienteTelefono}>
                          {cita.pacienteTelefono}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Médico */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Stethoscope size={16} className="text-slate-400" />
                    <div className="truncate" title={cita.medicoNombres && cita.medicoApellidos ? `${cita.medicoNombres} ${cita.medicoApellidos}` : 'Sin médico'}>
                      {cita.medicoNombres && cita.medicoApellidos ? `${cita.medicoNombres} ${cita.medicoApellidos}` : 'Sin médico'}
                    </div>
                  </div>
                </td>

                {/* Hospital */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-slate-400" />
                    <div className="truncate" title={cita.hospitalNombre || 'Sin hospital'}>
                      {cita.hospitalNombre || 'Sin hospital'}
                    </div>
                  </div>
                </td>

                {/* Fecha */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    <div>
                      <div className="text-sm font-medium">
                        {formatDate(cita.fechaInicio)}
                      </div>
                      {cita.fechaFin && cita.fechaFin !== cita.fechaInicio && (
                        <div className="text-xs text-slate-500">
                          hasta {formatDate(cita.fechaFin)}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Estado */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getEstadoColor(cita.estado)}`}
                  >
                    {getEstadoText(cita.estado)}
                  </span>
                </td>

                {/* Acciones */}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit?.(cita)}
                      className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                      title="Editar"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => onDelete?.(cita)}
                      className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}