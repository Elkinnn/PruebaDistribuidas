import { useState } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

export default function Perfil() {
  // Datos de prueba del médico
  const medicoData = {
    nombre: "Dr. María Elena Rodríguez",
    especialidades: ["Cardiología", "Medicina Interna"],
    hospital: "Hospital Central San José",
    email: "maria.rodriguez@medicitas.com",
    telefono: "+1 (555) 123-4567",
    fechaIngreso: "14 de marzo de 2020",
    direccion: "Av. Principal 123, Ciudad, País",
    idMedico: "doc-001",
    diasTrabajo: ["Lun", "Mar", "Mié", "Jue", "Vie"],
    horario: "08:00 - 17:00"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mi Perfil</h1>
        <p className="text-slate-600">Información personal y profesional</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal y Profesional */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">{medicoData.nombre}</h2>
                
                {/* Especialidades */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {medicoData.especialidades.map((especialidad, index) => (
                    <Badge key={index} className="bg-slate-100 text-slate-700">
                      {especialidad}
                    </Badge>
                  ))}
                </div>
                
                {/* Hospital */}
                <div className="flex items-center mt-3 text-slate-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {medicoData.hospital}
                </div>
                
                {/* Información de contacto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <div>
                        <div className="text-xs font-medium text-slate-500">Email</div>
                        <div className="text-sm text-slate-800">{medicoData.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <div>
                        <div className="text-xs font-medium text-slate-500">Teléfono</div>
                        <div className="text-sm text-slate-800">{medicoData.telefono}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="text-xs font-medium text-slate-500">Fecha de Ingreso</div>
                        <div className="text-sm text-slate-800">{medicoData.fechaIngreso}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="text-xs font-medium text-slate-500">Dirección</div>
                        <div className="text-sm text-slate-800">{medicoData.direccion}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Acciones */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Acciones</h3>
            <p className="text-sm text-slate-600 mb-4">Configuración y ajustes</p>
            
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Configuración
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Editar Perfil
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Especialidades
              </Button>
            </div>
          </Card>

          {/* Información Profesional */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Información Profesional</h3>
            
            <div className="space-y-3">
              <div>
                <div className="text-xs font-medium text-slate-500">Especialidades:</div>
                <div className="text-sm text-slate-800">{medicoData.especialidades.join(", ")}</div>
              </div>
              
              <div>
                <div className="text-xs font-medium text-slate-500">Centro Médico:</div>
                <div className="text-sm text-slate-800">{medicoData.hospital}</div>
              </div>
              
              <div>
                <div className="text-xs font-medium text-slate-500">ID Médico:</div>
                <div className="text-sm text-slate-800">{medicoData.idMedico}</div>
              </div>
            </div>
          </Card>

          {/* Horario de Trabajo */}
          <Card className="p-6">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900">Horario de Trabajo</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">Horarios de atención a pacientes</p>
            
            <div className="space-y-3">
              <div>
                <div className="text-xs font-medium text-slate-500 mb-2">Días de trabajo:</div>
                <div className="flex flex-wrap gap-2">
                  {medicoData.diasTrabajo.map((dia, index) => (
                    <Badge key={index} className="bg-slate-100 text-slate-700">
                      {dia}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-xs font-medium text-slate-500">Horario:</div>
                <div className="text-sm text-slate-800">{medicoData.horario}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
