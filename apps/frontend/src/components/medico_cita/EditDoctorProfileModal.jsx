import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";

const DIAS = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

export default function EditDoctorProfileModal({ open, onClose, initial, onSave }) {
  if (!open) return null;

  const data = { ...initial };
  // form local rudimentario sin estado controlado por simplicidad:
  function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      nombre: form.get("nombre") || "",
      email: form.get("email") || "",
      diasTrabajo: DIAS.filter(d => form.get(`dia_${d}`)),
    };
    onSave(payload);
  }

  return (
    <Modal open={open} onClose={onClose} width="max-w-2xl">
      <div className="bg-white rounded-2xl p-6 w-full overflow-x-hidden">
        <h3 className="text-xl font-bold text-slate-900 mb-1">Editar Perfil</h3>
        <p className="text-slate-600 mb-4">Actualiza tu información profesional</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Información editable */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Información Personal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input 
                  name="nombre" 
                  label="Nombre Completo" 
                  defaultValue={data.nombre}
                  required
                />
              </div>
              <div>
                <Input 
                  name="email" 
                  type="email" 
                  label="Email" 
                  defaultValue={data.email}
                  required
                />
              </div>
            </div>
          </div>

          {/* Información de solo lectura */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Información Profesional</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Hospital</label>
                <div className="text-lg font-semibold text-slate-900">{data.hospital}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Especialidades</label>
                <div className="text-lg font-semibold text-slate-900">
                  {data.especialidades && data.especialidades.length > 0 
                    ? data.especialidades.join(', ') 
                    : 'Sin especialidades asignadas'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Campos editables */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Horario de Trabajo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Días de trabajo</label>
                <div className="flex flex-wrap gap-3">
                  {DIAS.map((d) => (
                    <label key={d} className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name={`dia_${d}`}
                        defaultChecked={data.diasTrabajo?.includes(d)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      {d}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Horario</label>
                <div className="text-lg font-semibold text-slate-900 bg-white p-3 rounded-lg border">
                  {data.horario}
                </div>
                <p className="text-xs text-slate-500 mt-1">El horario no se puede modificar desde aquí</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              onClick={onClose}
              className="bg-slate-500 hover:bg-slate-600 text-white"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
