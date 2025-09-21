import { useEffect, useState } from "react";
import { medicoApi } from "../../api/medico";
import Toolbar from "../../components/ui/Toolbar";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";


export default function Especialidades() {
  const [hosp, setHosp] = useState([]);
  const [mias, setMias] = useState([]);

  useEffect(() => {
    (async () => {
      const [eh, em] = await Promise.all([medicoApi.espHospital(), medicoApi.misEsp()]);
      setHosp(eh || []); setMias(em || []);
    })();
  }, []);

  return (
    <div className="grid gap-6">
      <Toolbar title="Especialidades Médicas" subtitle="Disponibles en tu hospital y tus propias especialidades." />
      <section className="grid gap-3">
        <h2 className="text-sm font-semibold text-slate-700">En tu hospital</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {hosp.map((e) => (
            <Card key={e.id}><div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900">{e.nombre}</h3>
                <Badge className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">Activa</Badge>
              </div>
              {e.descripcion && <p className="mt-1 text-sm text-slate-600">{e.descripcion}</p>}
            </div></Card>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold text-slate-700">Tus especialidades</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {mias.map((e) => (
            <Card key={e.id}><div className="p-4">
              <h3 className="font-medium text-slate-900">{e.nombre}</h3>
              {e.descripcion && <p className="mt-1 text-sm text-slate-600">{e.descripcion}</p>}
            </div></Card>
          ))}
        </div>
      </section>
    </div>
  );
}
