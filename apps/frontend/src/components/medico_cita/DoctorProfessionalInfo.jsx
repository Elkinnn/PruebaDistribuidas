import Card from "../ui/Card";

export default function DoctorProfessionalInfo({ data }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Información Profesional</h3>

      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-slate-500">Especialidades:</div>
          <div className="text-sm text-slate-800">{data.especialidades.join(", ")}</div>
        </div>

        <div>
          <div className="text-xs font-medium text-slate-500">Centro Médico:</div>
          <div className="text-sm text-slate-800">{data.hospital}</div>
        </div>

        <div>
          <div className="text-xs font-medium text-slate-500">ID Médico:</div>
          <div className="text-sm text-slate-800">{data.idMedico}</div>
        </div>
      </div>
    </Card>
  );
}
