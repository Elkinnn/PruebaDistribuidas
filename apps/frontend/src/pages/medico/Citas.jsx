// src/pages/medico/Citas.jsx
import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import { listCitas, createCita, updateCita, deleteCita, CITA_ESTADOS } from "../../api/medico_cita";

const ESTADOS_OPTS = [
  { value: "PROGRAMADA", label: "Programada" },
  { value: "CANCELADA",  label: "Cancelada"  },
  { value: "ATENDIDA",   label: "Atendida"   },
];

const SEXOS = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino",  label: "Femenino"  },
];

function isoToLocal(dt) {
  if (!dt) return "";
  const d = new Date(dt); if (isNaN(d)) return "";
  const p = (n)=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function Citas() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const locked = Boolean(editing); // <- SOLO Estado y Fin editables
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [q, setQ] = useState("");

  // Ocultar scroll del body cuando el modal está abierto
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const emptyForm = useMemo(() => ({
    medicoId: "",
    inicio: "",
    fin: "",
    motivo: "",
    estado: "PROGRAMADA",
    paciente: {
      nombres: "",
      apellidos: "",
      documento: "",
      telefono: "",
      email: "",
      fechaNacimiento: "",
      sexo: "masculino",
    },
  }), []);

  const [form, setForm] = useState(emptyForm);

  // mock de médicos (cámbialo si tienes API)
  const medicos = [
    { id: 1, nombre: "Dra. Ana Martínez" },
    { id: 2, nombre: "Dr. Luis Pérez" },
    { id: 3, nombre: "Dra. Sofía Delgado" },
  ];

  async function load() {
    setLoading(true);
    try {
      const res = await listCitas({ q, pageSize: 1000 });
      setItems(res.items);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [q]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setMsg("");
    setOpen(true);
  }
  function openEdit(cita) {
    setEditing(cita);
    setForm({
      medicoId: cita.medicoId,
      inicio: isoToLocal(cita.inicio),
      fin: isoToLocal(cita.fin),
      motivo: cita.motivo || "",
      estado: cita.estado || "PROGRAMADA",
      paciente: {
        nombres: cita.paciente?.nombres || "",
        apellidos: cita.paciente?.apellidos || "",
        documento: cita.paciente?.documento || "",
        telefono: cita.paciente?.telefono || "",
        email: cita.paciente?.email || "",
        fechaNacimiento: cita.paciente?.fechaNacimiento || "",
        sexo: cita.paciente?.sexo || "masculino",
      },
    });
    setMsg("");
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    try {
      if (editing) {
        await updateCita(editing.id, { estado: form.estado, fin: form.fin });
        setMsg("Cita actualizada exitosamente.");
      } else {
        await createCita(form);
        setMsg("Cita creada exitosamente.");
      }
      setOpen(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setMsg(err.message || "Error al guardar.");
    }
  }

  async function handleDelete(id) {
    try {
      await deleteCita(id); // API bloquea si está PROGRAMADA
      await load();
    } catch (e) { alert(e.message); }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Citas</h1>
          <p className="text-slate-600">Administra tus citas médicas</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar (paciente, motivo, estado)…"
            className="w-56 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          />
          <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700">Nueva Cita</Button>
        </div>
      </div>

      {/* Lista */}
      <div className="grid gap-4">
        {loading && <p className="text-slate-500 text-sm">Cargando…</p>}
        {!loading && items.length === 0 && <Card className="p-6"><p className="text-slate-500 text-sm">No hay citas.</p></Card>}
        {items.map((c) => {
          const nombre = `${c.paciente?.nombres || ""} ${c.paciente?.apellidos || ""}`.trim();
          const i = new Date(c.inicio), f = new Date(c.fin);
          const fecha = i.toLocaleDateString();
          const hora  = `${i.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})} — ${f.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}`;
          const badge =
            c.estado === "PROGRAMADA" ? "bg-blue-100 text-blue-700" :
            c.estado === "ATENDIDA"   ? "bg-gray-200 text-gray-700" :
                                        "bg-rose-100 text-rose-700";
          return (
            <Card key={c.id} className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{nombre || "Paciente"}</h3>
                  <p className="text-slate-600">{c.motivo || "—"}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/></svg>
                      {fecha}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/></svg>
                      {hora}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge}`}>
                    {ESTADOS_OPTS.find(e=>e.value===c.estado)?.label || c.estado}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(c)}>Editar</Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(c.id)}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal (sin scroll visible) */}
      <Modal open={open} onClose={() => setOpen(false)} width="max-w-3xl">
        <div className="bg-white rounded-2xl p-6 max-w-3xl w-full mx-4 overflow-hidden">
          {/* Header con “logo” */}
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#2563eb">
                <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1zM4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9H4z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{editing ? "Editar Cita" : "Nueva Cita"}</h3>
              <p className="text-slate-600">Agenda una nueva consulta médica</p>
            </div>
          </div>

          {msg && (
            <div className={`mb-4 rounded-lg p-3 text-sm ${
              msg.includes("exitosamente") ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                                            : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Paciente */}
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-3">Datos del paciente</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nombres *"  placeholder="Ej: Juan Carlos"  value={form.paciente.nombres}
                  onChange={(e)=>setForm(p=>({...p, paciente:{...p.paciente, nombres:e.target.value}}))}
                  required disabled={locked} />
                <Input label="Apellidos *" placeholder="Ej: Pérez García" value={form.paciente.apellidos}
                  onChange={(e)=>setForm(p=>({...p, paciente:{...p.paciente, apellidos:e.target.value}}))}
                  required disabled={locked} />
                <Input label="Documento" placeholder="Cédula/Documento" value={form.paciente.documento}
                  onChange={(e)=>setForm(p=>({...p, paciente:{...p.paciente, documento:e.target.value}}))}
                  disabled={locked} />
                <Input label="Teléfono" placeholder="099 999 9999" value={form.paciente.telefono}
                  onChange={(e)=>setForm(p=>({...p, paciente:{...p.paciente, telefono:e.target.value}}))}
                  disabled={locked} />
                <Input type="email" label="Email" placeholder="correo@ejemplo.com" value={form.paciente.email}
                  onChange={(e)=>setForm(p=>({...p, paciente:{...p.paciente, email:e.target.value}}))}
                  disabled={locked} />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Fecha de nacimiento</label>
                  <input type="date"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                    value={form.paciente.fechaNacimiento}
                    onChange={(e)=>setForm(p=>({...p, paciente:{...p.paciente, fechaNacimiento:e.target.value}}))}
                    disabled={locked} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sexo</label>
                  <select
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                    value={form.paciente.sexo}
                    onChange={(e)=>setForm(p=>({...p, paciente:{...p.paciente, sexo:e.target.value}}))}
                    disabled={locked}>
                    {SEXOS.map((s)=><option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Cita */}
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-3">Datos de la cita</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Médico *</label>
                  <select
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                    value={form.medicoId}
                    onChange={(e)=>setForm(p=>({ ...p, medicoId:e.target.value }))}
                    required disabled={locked}>
                    <option value="" disabled>Selecciona…</option>
                    {medicos.map((m)=><option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Inicio *</label>
                    <input type="datetime-local"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                      value={form.inicio}
                      onChange={(e)=>setForm(p=>({ ...p, inicio:e.target.value }))}
                      required disabled={locked} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Fin *</label>
                    <input type="datetime-local"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                      value={form.fin}
                      onChange={(e)=>setForm(p=>({ ...p, fin:e.target.value }))}
                      required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Motivo</label>
                  <textarea rows={3} placeholder="Detalle breve"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 resize-none"
                    value={form.motivo}
                    onChange={(e)=>setForm(p=>({ ...p, motivo:e.target.value }))}
                    disabled={locked} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
                  <select
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                    value={form.estado}
                    onChange={(e)=>setForm(p=>({ ...p, estado:e.target.value }))}
                  >
                    {ESTADOS_OPTS.map((s)=><option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={()=>setOpen(false)} className="px-6">Cancelar</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 px-6">
                {editing ? "Guardar" : "Guardar"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
