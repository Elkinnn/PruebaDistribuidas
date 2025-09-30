import Card from "../ui/Card";
import Badge from "../ui/Badge";

export default function DoctorWorkSchedule({ data }) {
  return (
    <Card className="p-6">
      <div className="flex items-center mb-2">
        <svg className="w-5 h-5 mr-2 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <h3 className="text-lg font-semibold text-slate-900">Horario de Trabajo</h3>
      </div>
      <p className="text-sm text-slate-600 mb-4">Horarios de atención a pacientes</p>

      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-slate-500 mb-2">Días de trabajo:</div>
          <div className="flex flex-wrap gap-2">
            {data.diasTrabajo.map((d, i) => (
              <Badge key={i} className="bg-slate-100 text-slate-700">{d}</Badge>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500">Horario:</div>
          <div className="text-sm text-slate-800">{data.horario}</div>
        </div>
      </div>
    </Card>
  );
}
