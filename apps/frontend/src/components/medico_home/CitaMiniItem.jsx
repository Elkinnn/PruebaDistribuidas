// Item compacto para una cita
export default function CitaMiniItem({ cita }) {
  const nombre = `${cita?.paciente?.nombre ?? ""} ${cita?.paciente?.apellido ?? ""}`.trim();
  const motivo = cita?.motivo ?? "";
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
        <p className="font-medium text-slate-900 truncate">{nombre || "Paciente"}</p>
        <p className="text-sm text-slate-600 truncate">{motivo || "Consulta"}</p>
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
