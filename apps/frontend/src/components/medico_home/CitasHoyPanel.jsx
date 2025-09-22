import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import { medicoCitaApi as medicoApi } from "../../api/medico_cita"; 
// ⬆️ si en tu proyecto quedó en src/api/cita.js, cambia por: ../../api/cita

import CitaMiniItem from "./CitaMiniItem";

export default function CitasHoyPanel({
  title = "Citas de Hoy",
  to = "/medico/citas",
  limit = 3,
  estado = "PROGRAMADA", // muestra las programadas por defecto
  medicoId,              // opcional si quieres filtrar por médico concreto
  className = "",
}) {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const res = await medicoApi.citasHoy({ limit, estado, medicoId });
        if (!off && res?.success) setCitas(res.data ?? []);
      } catch (e) {
        console.error("Error cargando citas de hoy:", e);
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => { off = true; };
  }, [limit, estado, medicoId]);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <Link to={to} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          Ver todas
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : citas.length > 0 ? (
        <div className="space-y-3">
          {citas.slice(0, limit).map((c) => (
            <CitaMiniItem key={c.id} cita={c} />
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-center py-4">No hay citas programadas para hoy</p>
      )}
    </Card>
  );
}
