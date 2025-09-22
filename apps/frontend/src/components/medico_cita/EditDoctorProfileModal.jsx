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
      telefono: form.get("telefono") || "",
      hospital: form.get("hospital") || "",
      direccion: form.get("direccion") || "",
      idMedico: form.get("idMedico") || "",
      especialidades: (form.get("especialidades") || ""),
      horario: form.get("horario") || "",
      diasTrabajo: DIAS.filter(d => form.get(`dia_${d}`)),
    };
    onSave(payload);
  }

  return (
    <Modal open={open} onClose={onClose} width="max-w-2xl">
      <div className="bg-white rounded-2xl p-6 w-full overflow-x-hidden">
        <h3 className="text-xl font-bold text-slate-900 mb-1">Editar Perfil</h3>
        <p className="text-slate-600 mb-4">Actualiza tu información profesional</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="nombre" label="Nombre completo" defaultValue={data.nombre} required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="email" type="email" label="Email" defaultValue={data.email} required />
            <Input name="telefono" label="Teléfono" defaultValue={data.telefono} />
            <Input name="hospital" label="Centro Médico" defaultValue={data.hospital} />
            <Input name="idMedico" label="ID Médico" defaultValue={data.idMedico} />
          </div>
          <Input name="direccion" label="Dirección" defaultValue={data.direccion} />
          <Input
            name="especialidades"
            label="Especialidades (separadas por coma)"
            defaultValue={data.especialidades?.join(", ")}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Días de trabajo</label>
              <div className="flex flex-wrap gap-3">
                {DIAS.map((d) => (
                  <label key={d} className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      name={`dia_${d}`}
                      defaultChecked={data.diasTrabajo?.includes(d)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    {d}
                  </label>
                ))}
              </div>
            </div>
            <Input name="horario" label="Horario" placeholder="08:00 - 17:00" defaultValue={data.horario} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Guardar cambios</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
