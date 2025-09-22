// src/components/cita/MedicoCitaForm.jsx
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

export default function MedicoCitaForm({
  form,
  setForm,
  medicos = [],
  locked = false,                 // si true (editar), solo permite Estado y Fin
  onCancel,
  onSubmit,
  submitLabel = "Guardar",
  title = "Nueva Cita",
  subtitle = "Agenda una nueva consulta médica",
  msg,                            // 👈 RECIBIMOS EL MENSAJE
}) {
  return (
    <div className="bg-white rounded-2xl p-6 max-w-3xl w-full overflow-hidden">
      {/* Header con icono */}
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

      {/* Banner de error/éxito */}
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

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Datos del paciente */}
        <div>
          <h4 className="text-lg font-semibold text-slate-900 mb-3">Datos del paciente</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombres *"
              placeholder="Ej: Juan Carlos"
              value={form.paciente.nombres}
              onChange={(e)=>setForm(p=>({...p, paciente:{...p.paciente, nombres:e.target.value}}))}
              required
              disabled={locked}
            />
            <Input
              label="Apellidos *"
              placeholder="Ej: Pérez García"
              value={form.paciente.apellidos}
              onChange={(e)=>setForm(p=>({...p, paciente:{...p.paciente, apellidos:e.target.value}}))}
              required
              disabled={locked}
            />
            <Input
              label="Documento"
              placeholder="Cédula/Documento"
              value={form.paciente.documento}
              onChange={(e)=>setForm(p=>({...p, paciente:{...p.paciente, documento:e.target.value}}))}
              disabled={locked}
            />
            <Input
              label="Teléfono"
              placeholder="099 999 9999"
              value={form.paciente.telefono}
              onChange={(e)=>setForm(p=>({...p, paciente:{...p.paciente, telefono:e.target.value}}))}
              disabled={locked}
            />
            <Input
              type="email"
              label="Email"
              placeholder="correo@ejemplo.com"
              value={form.paciente.email}
              onChange={(e)=>setForm(p=>({...p, paciente:{...p.paciente, email:e.target.value}}))}
              disabled={locked}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fecha de nacimiento</label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                value={form.paciente.fechaNacimiento}
                onChange={(e)=>setForm(p=>({...p, paciente:{...p.paciente, fechaNacimiento:e.target.value}}))}
                disabled={locked}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sexo</label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                value={form.paciente.sexo}
                onChange={(e)=>setForm(p=>({...p, paciente:{...p.paciente, sexo:e.target.value}}))}
                disabled={locked}
              >
                {SEXOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Datos de la cita */}
        <div>
          <h4 className="text-lg font-semibold text-slate-900 mb-3">Datos de la cita</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Médico *</label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                value={form.medicoId}
                onChange={(e)=>setForm(p=>({ ...p, medicoId:e.target.value }))}
                required
                disabled={locked}
              >
                <option value="" disabled>Selecciona…</option>
                {medicos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Inicio *</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  value={form.inicio}
                  onChange={(e)=>setForm(p=>({ ...p, inicio:e.target.value }))}
                  required
                  disabled={locked}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fin *</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  value={form.fin}
                  onChange={(e)=>setForm(p=>({ ...p, fin:e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Motivo</label>
              <textarea
                rows={3}
                placeholder="Detalle breve"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 resize-none"
                value={form.motivo}
                onChange={(e)=>setForm(p=>({ ...p, motivo:e.target.value }))}
                disabled={locked}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                value={form.estado}
                onChange={(e)=>setForm(p=>({ ...p, estado:e.target.value }))}
              >
                {ESTADOS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="px-6">Cancelar</Button>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 px-6">
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
