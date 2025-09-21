import { useEffect, useState } from "react";
import { medicoApi } from "../../api/medico";
import Toolbar from "../../components/ui/Toolbar";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

export default function Perfil() {
  const [me, setMe] = useState(null);
  useEffect(() => { medicoApi.me().then(setMe); }, []);
  if (!me) return <div className="text-slate-500">Cargando…</div>;

  const { medico, hospital, especialidades = [] } = me; // adapta a tu payload

  return (
    <div className="grid gap-6">
      <Toolbar title="Mi Perfil" subtitle="Información personal y profesional." />
      <Card>
        <div className="grid gap-1 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Dr. {medico?.nombres} {medico?.apellidos}
          </h2>
          <div className="text-sm text-slate-600">{hospital?.nombre}</div>

          <div className="mt-2 flex flex-wrap gap-2">
            {especialidades.map((e) => (
              <Badge key={e.id} className="bg-slate-100 text-slate-700">
                {e.nombre}
              </Badge>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-medium text-slate-500">Email</div>
              <div className="text-sm text-slate-800">{medico?.email}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Centro Médico</div>
              <div className="text-sm text-slate-800">{hospital?.direccion}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
