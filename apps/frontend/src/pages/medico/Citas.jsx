import { useEffect, useMemo, useState } from "react";
import { medicoApi } from "../../api/medico";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import Toolbar from "./components/Toolbar";
import Modal from "./components/Modal";
import AppointmentCard from "./components/AppointmentCard";

function isInCourse(c, now = new Date()) {
  const i = new Date(c.fechaInicio), f = new Date(c.fechaFin);
  return c.estado === "PROGRAMADA" && i <= now && now < f;
}

export default function Citas() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ pacienteNombre: "", motivo: "", inicio: "", fin: "" });
  const [msg, setMsg] = useState("");

  const enCurso = useMemo(() => items.find((c) => isInCourse(c)), [items]);

  async function load() {
    setLoading(true);
    try { setItems(await medicoApi.citas()); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function solapa(i, f) {
    const ini = new Date(i), fin = new Date(f);
    return items.some((c) => {
      if (c.estado === "CANCELADA") return false;
      const ci = new Date(c.fechaInicio), cf = new Date(c.fechaFin);
      return ini < cf && fin > ci;
    });
  }

  async function crear(e) {
    e.preventDefault();
    setMsg("");
    const { pacienteNombre, motivo, inicio, fin } = form;
    if (!pacienteNombre || !motivo || !inicio || !fin) return setMsg("Completa todos los campos.");
    const i = new Date(inicio), f = new Date(fin), now = new Date();
    if (i < now) return setMsg("La hora de inicio no puede estar en el pasado.");
    if (f <= i) return setMsg("La hora de fin debe ser mayor que la de inicio.");
    if (enCurso) return setMsg("Debes terminar la cita en curso antes de agendar otra.");
    if (solapa(inicio, fin)) return setMsg("El horario se solapa con otra cita.");

    await medicoApi.crearCita({ pacienteNombre, motivo, fechaInicio: i.toISOString(), fechaFin: f.toISOString() });
    setOpen(false);
    setForm({ pacienteNombre: "", motivo: "", inicio: "", fin: "" });
    load();
  }

  async function terminar(id){ await medicoApi.terminarCita(id); load(); }
  async function cancelar(id){ await medicoApi.cancelarCita(id); load(); }

  return (
    <div className="grid gap-6">
      <Toolbar title="Gestión de Citas" subtitle="Administra tus citas médicas.">
        <Button onClick={() => setOpen(true)} disabled={!!enCurso}>Nueva Cita</Button>
      </Toolbar>

      {enCurso && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <b>Cita en curso:</b> {enCurso.pacienteNombre} (
          {new Date(enCurso.fechaInicio).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          –{new Date(enCurso.fechaFin).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}). Termínala para agendar otra.
        </div>
      )}

      {/* Lista */}
      <div className="grid gap-4">
        {loading ? (
          <Card><div className="p-6 text-slate-500">Cargando…</div></Card>
        ) : items.length === 0 ? (
          <Card><div className="p-6 text-slate-500">No hay citas.</div></Card>
        ) : (
          items.map((c) => (
            <AppointmentCard key={c.id} cita={c} onTerminar={terminar} onCancelar={cancelar} />
          ))
        )}
      </div>

      {/* Modal crear */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <form className="grid gap-3" onSubmit={crear}>
          <h3 className="text-lg font-semibold text-slate-900">Nueva Cita</h3>
          <Input label="Paciente" value={form.pacienteNombre}
            onChange={(e) => setForm((s) => ({ ...s, pacienteNombre: e.target.value }))} />
          <Input label="Motivo" value={form.motivo}
            onChange={(e) => setForm((s) => ({ ...s, motivo: e.target.value }))} />
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Inicio</label>
            <input type="datetime-local"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-4 focus:ring-slate-100"
              value={form.inicio} onChange={(e) => setForm((s) => ({ ...s, inicio: e.target.value }))}/>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Fin</label>
            <input type="datetime-local"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-4 focus:ring-slate-100"
              value={form.fin} onChange={(e) => setForm((s) => ({ ...s, fin: e.target.value }))}/>
          </div>
          {msg && <div className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700 ring-1 ring-rose-200">{msg}</div>}
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Crear</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
