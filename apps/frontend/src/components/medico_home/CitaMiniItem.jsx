// Item compacto para una cita
export default function CitaMiniItem({ cita }) {
  // Manejar diferentes estructuras de datos
  const nombre = cita?.paciente_nombres && cita?.paciente_apellidos 
    ? `${cita.paciente_nombres} ${cita.paciente_apellidos}`.trim()
    : cita?.paciente?.nombre && cita?.paciente?.apellido
    ? `${cita.paciente.nombre} ${cita.paciente.apellido}`.trim()
    : cita?.pacienteNombre || "Paciente";
    
  const motivo = cita?.motivo ?? "Consulta médica";
  const hora = cita?.hora ?? "";

  const colorByEstado = {
    PROGRAMADA: "bg-emerald-100 text-emerald-800",
    ATENDIDA: "bg-blue-100 text-blue-800",
    CANCELADA: "bg-rose-100 text-rose-800",
  };
  const chip = colorByEstado[cita?.estado] ?? "bg-slate-100 text-slate-800";

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <div className="min-w-0">
        <p className="font-medium text-slate-900 truncate">{nombre}</p>
        <p className="text-sm text-slate-600 truncate">{motivo}</p>
      </div>
      <div className="text-right shrink-0 ml-3">
        <p className="text-sm font-medium text-slate-900">{hora}</p>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${chip}`}>
          {cita?.estado ?? "—"}
        </span>
      </div>
    </div>
  );
}
