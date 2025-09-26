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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profileData = await getMedicoProfile();
        setData(profileData);
      } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback a datos del localStorage si la API falla
        const user = JSON.parse(localStorage.getItem("clinix_medico_user") || "null");
        if (user) {
          setData({
            nombre: user.nombre || "Dr. Usuario",
            especialidades: [user.especialidad || "Medicina General"],
            hospital: "Hospital Central",
            email: user.email || "",
            telefono: "No especificado",
            fechaIngreso: "No especificada",
            direccion: "No especificada",
            diasTrabajo: ["Lun", "Mar", "Mié", "Jue", "Vie"],
            horario: "08:00 - 17:00",
            hospital_direccion: "Dirección no disponible"
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, []);

  async function onSave(patch) {
    try {
      // Separar los datos que van al backend de los que solo se actualizan en el frontend
      const { diasTrabajo, ...backendData } = patch;
      
      // Actualizar en el backend solo nombre y email
      if (backendData.nombre || backendData.email) {
        await updateMedicoProfile(backendData);
        
        // Actualizar el estado local inmediatamente después de la actualización exitosa
        setData(prev => ({
          ...prev,
          ...backendData
        }));

        // Actualizar localStorage con el nuevo nombre y email
        if (backendData.nombre || backendData.email) {
          const userData = JSON.parse(localStorage.getItem("clinix_user_medico") || "{}");
          if (backendData.nombre) {
            userData.nombre = backendData.nombre;
          }
          if (backendData.email) {
            userData.email = backendData.email;
          }
          localStorage.setItem("clinix_user_medico", JSON.stringify(userData));
          
          // Disparar evento personalizado para actualizar el layout
          window.dispatchEvent(new CustomEvent('medicoProfileUpdated', { 
            detail: { 
              nombre: backendData.nombre,
              email: backendData.email 
            } 
          }));
        }
      }
      
      // Actualizar días de trabajo solo en el frontend
      if (diasTrabajo) {
        setData(prev => ({
          ...prev,
          diasTrabajo: diasTrabajo
        }));
      }
      
      setOpenEdit(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mi Perfil</h1>
          <p className="text-slate-600">Cargando información...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Header mejorado */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Mi Perfil Profesional</h1>
        <p className="text-lg text-slate-600">Información personal y profesional</p>
      </div>

      {/* Información principal del médico */}
      <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-xl">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Avatar y nombre */}
          <div className="text-center lg:text-left">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 mx-auto lg:mx-0">
              {data.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{data.nombre}</h2>
            <div className="flex items-center justify-center lg:justify-start gap-2 text-slate-600 mb-4">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{data.hospital}</span>
            </div>
          </div>

          {/* Información esencial */}
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Email</p>
                  <p className="text-lg font-semibold text-slate-900">{data.email}</p>
                </div>
              </div>

              {/* Horario de trabajo */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Horario de Trabajo</p>
                  <p className="text-lg font-semibold text-slate-900">{data.horario}</p>
                </div>
              </div>
            </div>

            {/* Días de trabajo */}
            <div className="bg-white/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500 font-medium">Días de Trabajo</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.diasTrabajo.map((dia, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {dia}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Información adicional y acciones en grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Especialidades - Solo si hay especialidades */}
        {data.especialidades && data.especialidades.length > 0 && (
          <Card className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Especialidades</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {data.especialidades.map((especialidad, index) => (
                  <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-sm font-medium shadow-md">
                    {especialidad}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Acciones */}
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Gestionar Perfil</h3>
            <p className="text-slate-600 mb-6">Actualiza tu información personal y profesional</p>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => setOpenEdit(true)}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
