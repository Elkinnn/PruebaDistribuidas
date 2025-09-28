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
      nombres: form.get("nombres") || "",
      apellidos: form.get("apellidos") || "",
      email: form.get("email") || "",
      diasTrabajo: DIAS.filter(d => form.get(`dia_${d}`)),
    };
    onSave(payload);
  }

  return (
    <Modal open={open} onClose={onClose} width="max-w-xl">
      <div className="bg-white rounded-2xl p-8 w-full overflow-x-hidden">
        {/* Header mejorado */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            {data.nombre?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'DR'}
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Editar Perfil</h3>
          <p className="text-slate-600">Actualiza tu información personal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Información Personal */}
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="text-lg font-semibold text-slate-900 mb-1">Información Personal</h4>
              <p className="text-sm text-slate-600">Actualiza tus datos de contacto</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Input 
                  name="nombres" 
                  label="Nombres" 
                  defaultValue={data.nombres || data.nombre?.split(' ')[0] || ''}
                  required
                  className="pl-12"
                />
                <div className="absolute left-4 top-8 w-5 h-5 text-slate-400">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div className="relative">
                <Input 
                  name="apellidos" 
                  label="Apellidos" 
                  defaultValue={data.apellidos || data.nombre?.split(' ').slice(1).join(' ') || ''}
                  required
                  className="pl-12"
                />
                <div className="absolute left-4 top-8 w-5 h-5 text-slate-400">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div className="relative md:col-span-2">
                <Input 
                  name="email" 
                  type="email" 
                  label="Correo Electrónico" 
                  defaultValue={data.email}
                  required
                  className="pl-12"
                />
                <div className="absolute left-4 top-8 w-5 h-5 text-slate-400">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Horario de Trabajo */}
          <div className="space-y-6">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="text-lg font-semibold text-slate-900 mb-1">Horario de Trabajo</h4>
              <p className="text-sm text-slate-600">Configura tus días laborales</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Días de trabajo</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {DIAS.map((d) => (
                      <label key={d} className="relative flex items-center justify-center p-3 rounded-lg border-2 border-slate-300 bg-white hover:border-green-400 hover:bg-green-50 transition-all cursor-pointer group">
                        <input
                          type="checkbox"
                          name={`dia_${d}`}
                          defaultChecked={data.diasTrabajo?.includes(d)}
                          className="sr-only peer"
                        />
                        <span className="relative z-10 text-sm font-medium text-slate-700 peer-checked:text-white group-hover:text-green-600 transition-colors">
                          {d}
                        </span>
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 border-2 border-green-500 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-500">Horario de atención</div>
                      <div className="text-lg font-semibold text-slate-900">{data.horario}</div>
                      <div className="text-xs text-slate-400 mt-1">No se puede modificar desde aquí</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <Button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
