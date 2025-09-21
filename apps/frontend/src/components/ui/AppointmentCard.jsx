import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Badge from "./Badge";

function isInCourse(c, now = new Date()) {
  const i = new Date(c.fechaInicio), f = new Date(c.fechaFin);
  return c.estado === "PROGRAMADA" && i <= now && now < f;
}
function isExpired(c, now = new Date()) {
  return c.estado === "PROGRAMADA" && new Date(c.fechaFin) < now;
}
function statusMeta(c) {
  if (c.estado === "CANCELADA") return ["Cancelada", "bg-rose-100 text-rose-700"];
  if (c.estado === "ATENDIDA") return ["Atendida", "bg-emerald-100 text-emerald-700"];
  if (isInCourse(c))         return ["En curso",  "bg-green-100 text-green-700"];
  if (isExpired(c))          return ["Vencida",   "bg-amber-100 text-amber-800"];
  return ["Programada", "bg-sky-100 text-sky-800"];
}

export default function AppointmentCard({ cita, onTerminar, onCancelar }) {
  const [txt, cls] = statusMeta(cita);
  const vencida = isExpired(cita);
  const enCurso = isInCourse(cita);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between p-5">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-slate-900">{cita.pacienteNombre}</h3>
            <Badge className={cls}>{txt}</Badge>
            {vencida && <Badge className="bg-amber-100 text-amber-800">Vencida</Badge>}
          </div>

          <div className="mt-1 text-sm text-slate-600">
            {new Date(cita.fechaInicio).toLocaleDateString()} ·{" "}
            {new Date(cita.fechaInicio).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            {" – "}
            {new Date(cita.fechaFin).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="mt-1 text-sm text-slate-700">{cita.motivo}</div>

          {vencida && (
            <div className="mt-1 text-xs text-amber-700">
              La cita ya caducó; no se puede modificar.
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {enCurso && (
            <Button size="sm" onClick={() => onTerminar(cita.id)}>
              Terminar
            </Button>
          )}
          {!enCurso && cita.estado === "PROGRAMADA" && !vencida && (
            <Button size="sm" variant="ghost" onClick={() => onCancelar(cita.id)}>
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
