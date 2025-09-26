import { useMemo, useEffect, useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

const ESTADOS_OPTS = [
  { value: "PROGRAMADA", label: "Programada" },
  { value: "CANCELADA",  label: "Cancelada"  },
  { value: "ATENDIDA",   label: "Atendida"   },
];

const SEXOS = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino",  label: "Femenino"  },
];

const onlyDigits = (s) => s.replace(/\D+/g, "");

export default function MedicoCitaForm({
  form,
  setForm,
  medicos = [],
  locked = false,
  onCancel,
  onSubmit,
  submitLabel = "Guardar",
  title = "Nueva Cita",
  subtitle = "Agenda una nueva consulta médica",
  msg,
}) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const markTouched = (name) => setTouched((t) => ({ ...t, [name]: true }));
  const showError = (name) => (touched[name] || submitted) && !!errors[name];

  // reset sexo vacío en creación
  useEffect(() => {
    if (!locked) {
      setForm((p) => ({
        ...p,
        paciente: { ...p.paciente, sexo: "" },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  const todayStr = useMemo(() => {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
  }, []);

  const setCedula = (v) =>
    setForm((p) => ({ ...p, paciente: { ...p.paciente, documento: onlyDigits(v).slice(0, 10) } }));
  const setTelefono = (v) =>
    setForm((p) => ({ ...p, paciente: { ...p.paciente, telefono: onlyDigits(v).slice(0, 10) } }));

  useEffect(() => {
    const e = {};
    if (!form.paciente.nombres.trim()) e.nombres = "Nombres es obligatorio.";
    if (!form.paciente.apellidos.trim()) e.apellidos = "Apellidos es obligatorio.";

    if (!form.paciente.documento) e.documento = "La cédula es obligatoria.";
    else if (form.paciente.documento.length !== 10) e.documento = "La cédula debe tener 10 dígitos.";

    if (!form.paciente.telefono) e.telefono = "El teléfono es obligatorio.";
    else if (form.paciente.telefono.length !== 10) e.telefono = "El teléfono debe tener 10 dígitos.";

    if (!form.paciente.fechaNacimiento) e.fechaNacimiento = "La fecha de nacimiento es obligatoria.";
    else {
      const fn = new Date(form.paciente.fechaNacimiento);
      const today = new Date(todayStr + "T23:59:59");
      if (!isNaN(fn) && fn > today) e.fechaNacimiento = "No puede ser una fecha futura.";
    }

    if (!form.paciente.sexo) e.sexo = "El sexo es obligatorio.";

    if (!String(form.motivo || "").trim()) e.motivo = "El motivo es obligatorio.";
    if (!form.medicoId) e.medicoId = "Selecciona un médico.";
    if (!form.inicio) e.inicio = "Inicio es obligatorio.";
    if (!form.fin) e.fin = "Fin es obligatorio.";

    if (form.inicio && form.fin) {
      const i = new Date(form.inicio);
      const f = new Date(form.fin);
      if (!isNaN(i) && !isNaN(f) && f <= i) e.fin = "La fecha de fin debe ser mayor que la de inicio.";
    }

    setErrors(e);
  }, [form, todayStr]);

  const isValid = Object.keys(errors).length === 0;

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    if (!isValid) return;
    onSubmit(e);
  }

  return (
    <div className="bg-white rounded-2xl p-6 max-w-3xl w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#2563eb">
            <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1zM4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9H4z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <p className="text-slate-600">{subtitle}</p>
        </div>
      </div>

      {msg && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm ${
            msg.toLowerCase().includes("exitosamente")
              ? "bg-green-50 text-green-700 ring-1 ring-green-200"
              : "bg-red-50 text-red-700 ring-1 ring-red-200"
          }`}
          aria-live="polite"
        >
          {msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Paciente */}
        <div>
          <h4 className="text-lg font-semibold text-slate-900 mb-3">Datos del paciente</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Nombres *"
                placeholder="Ej: Juan Carlos"
                value={form.paciente.nombres}
                onChange={(e)=>setForm(p=>({...p, paciente:{...p.paciente, nombres:e.target.value}}))}
                onBlur={()=>markTouched("nombres")}
                required
                disabled={locked}
                aria-invalid={showError("nombres")}
              />
              {showError("nombres") && <p className="mt-1 text-xs text-rose-600">{errors.nombres}</p>}
            </div>

            <div>
              <Input
                label="Apellidos *"
                placeholder="Ej: Pérez García"
                value={form.paciente.apellidos}
                onChange={(e)=>setForm(p=>({...p, paciente:{...p.paciente, apellidos:e.target.value}}))}
                onBlur={()=>markTouched("apellidos")}
                required
                disabled={locked}
                aria-invalid={showError("apellidos")}
              />
              {showError("apellidos") && <p className="mt-1 text-xs text-rose-600">{errors.apellidos}</p>}
            </div>

            <div>
              <Input
                label="Cédula *"
                placeholder="10 dígitos"
                inputMode="numeric"
                value={form.paciente.documento}
                onChange={(e)=>setCedula(e.target.value)}
                onBlur={()=>markTouched("documento")}
                required
                disabled={locked}
                aria-invalid={showError("documento")}
              />
              {showError("documento") && <p className="mt-1 text-xs text-rose-600">{errors.documento}</p>}
            </div>

            <div>
              <Input
                label="Teléfono *"
                placeholder="0999999999"
                inputMode="numeric"
                value={form.paciente.telefono}
                onChange={(e)=>setTelefono(e.target.value)}
                onBlur={()=>markTouched("telefono")}
                required
                disabled={locked}
                aria-invalid={showError("telefono")}
              />
              {showError("telefono") && <p className="mt-1 text-xs text-rose-600">{errors.telefono}</p>}
            </div>

            <div>
              <Input
                type="email"
                label="Email"
                placeholder="correo@ejemplo.com"
                value={form.paciente.email}
                onChange={(e)=>setForm(p=>({...p, paciente:{...p.paciente, email:e.target.value}}))}
                disabled={locked}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fecha de nacimiento *</label>
              <input
                type="date"
                max={todayStr}
                className={`w-full rounded-xl border ${showError("fechaNacimiento") ? "border-rose-400" : "border-slate-300"} bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100`}
                value={form.paciente.fechaNacimiento}
                onChange={(e)=>setForm(p=>({...p, paciente:{...p.paciente, fechaNacimiento:e.target.value}}))}
                onBlur={()=>markTouched("fechaNacimiento")}
                required
                disabled={locked}
                aria-invalid={showError("fechaNacimiento")}
              />
              {showError("fechaNacimiento") && <p className="mt-1 text-xs text-rose-600">{errors.fechaNacimiento}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sexo *</label>
              <select
                className={`w-full rounded-xl border ${showError("sexo") ? "border-rose-400" : "border-slate-300"} bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100`}
                value={form?.paciente?.sexo ?? ""}
                onChange={(e)=>setForm(p=>({...p, paciente:{...p.paciente, sexo:e.target.value}}))}
                onBlur={()=>markTouched("sexo")}
                required
                disabled={locked}
                aria-invalid={showError("sexo")}
              >
                <option value="" disabled>Selecciona…</option>
                {SEXOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              {showError("sexo") && <p className="mt-1 text-xs text-rose-600">{errors.sexo}</p>}
            </div>
          </div>
        </div>

        {/* Cita */}
        <div>
          <h4 className="text-lg font-semibold text-slate-900 mb-3">Datos de la cita</h4>
          <div className="grid grid-cols-1 gap-4">
            {/* Solo mostrar selector de médico si hay más de uno */}
            {medicos.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Médico *</label>
                <select
                  className={`w-full rounded-xl border ${showError("medicoId") ? "border-rose-400" : "border-slate-300"} bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100`}
                  value={form.medicoId}
                  onChange={(e)=>setForm(p=>({ ...p, medicoId:e.target.value }))}
                  onBlur={()=>markTouched("medicoId")}
                  required
                  disabled={locked}
                  aria-invalid={showError("medicoId")}
                >
                  <option value="" disabled>Selecciona…</option>
                  {medicos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
                {showError("medicoId") && <p className="mt-1 text-xs text-rose-600">{errors.medicoId}</p>}
              </div>
            )}
            
            {/* Mostrar médico seleccionado cuando solo hay uno */}
            {medicos.length === 1 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Médico</label>
                <div className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  {medicos[0].nombre}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Inicio *</label>
                <input
                  type="datetime-local"
                  className={`w-full rounded-xl border ${showError("inicio") ? "border-rose-400" : "border-slate-300"} bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100`}
                  value={form.inicio}
                  onChange={(e)=>setForm(p=>({ ...p, inicio:e.target.value }))}
                  onBlur={()=>markTouched("inicio")}
                  required
                  disabled={locked}
                  aria-invalid={showError("inicio")}
                />
                {showError("inicio") && <p className="mt-1 text-xs text-rose-600">{errors.inicio}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fin *</label>
                <input
                  type="datetime-local"
                  className={`w-full rounded-xl border ${showError("fin") ? "border-rose-400" : "border-slate-300"} bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100`}
                  value={form.fin}
                  onChange={(e)=>setForm(p=>({ ...p, fin:e.target.value }))}
                  onBlur={()=>markTouched("fin")}
                  required
                  aria-invalid={showError("fin")}
                />
                {showError("fin") && <p className="mt-1 text-xs text-rose-600">{errors.fin}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Motivo *</label>
              <textarea
                rows={3}
                placeholder="Detalle breve"
                className={`w-full rounded-xl border ${showError("motivo") ? "border-rose-400" : "border-slate-300"} bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 resize-none`}
                value={form.motivo}
                onChange={(e)=>setForm(p=>({ ...p, motivo:e.target.value }))}
                onBlur={()=>markTouched("motivo")}
                required
                disabled={locked}
                aria-invalid={showError("motivo")}
              />
              {showError("motivo") && <p className="mt-1 text-xs text-rose-600">{errors.motivo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                value={form.estado}
                onChange={(e)=>setForm(p=>({ ...p, estado:e.target.value }))}
                disabled={!locked}
              >
                {ESTADOS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              {!locked && (
                <p className="mt-1 text-xs text-slate-500">El estado se establece automáticamente como “Programada”.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="px-6">Cancelar</Button>
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isValid}
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
