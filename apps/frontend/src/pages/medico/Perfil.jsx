import { useEffect, useState } from "react";
import DoctorProfileHeader from "../../components/medico_cita/DoctorProfileHeader";
import DoctorWorkSchedule from "../../components/medico_cita/DoctorWorkSchedule";
import DoctorProfessionalInfo from "../../components/medico_cita/DoctorProfessionalInfo";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EditDoctorProfileModal from "../../components/medico_cita/EditDoctorProfileModal";
import { getMedicoProfile, updateMedicoProfile } from "../../api/medico_profile";

export default function Perfil() {
  const [data, setData] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);

  useEffect(() => {
    (async () => setData(await getMedicoProfile()))();
  }, []);

  async function onSave(patch) {
    const next = await updateMedicoProfile(patch);
    setData(next);
    setOpenEdit(false);
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mi Perfil</h1>
        <p className="text-slate-600">Información personal y profesional</p>
      </div>

      {/* FILA 1: Info personal + Horario (lado a lado y centrados) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <DoctorProfileHeader data={data} />
        <DoctorWorkSchedule data={data} />
      </div>

      {/* FILA 2: Info profesional + Acciones (solo Editar Perfil) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DoctorProfessionalInfo data={data} />
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Acciones</h3>
          <p className="text-sm text-slate-600 mb-4">Ajustes de tu cuenta</p>
          <div className="space-y-3">
            <Button
              className="w-full justify-start bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setOpenEdit(true)}
            >
              <svg className="w-4 h-4 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Editar Perfil
            </Button>
          </div>
        </Card>
      </div>

      {/* Modal editar */}
      <EditDoctorProfileModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        initial={data}
        onSave={onSave}
      />
    </div>
  );
}
