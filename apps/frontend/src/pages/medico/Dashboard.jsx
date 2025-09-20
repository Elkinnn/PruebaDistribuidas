import { Routes, Route } from 'react-router-dom'
import { Stethoscope, Users, Calendar, FileText, Plus } from 'lucide-react'

const MedicoDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Panel Médico</h1>
        <button className="btn btn-primary flex items-center space-x-2">
          <Plus size={16} />
          <span>Nueva Consulta</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <Users className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Pacientes</p>
              <p className="text-2xl font-bold">156</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <Calendar className="text-green-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Citas Hoy</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <FileText className="text-purple-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Consultas</p>
              <p className="text-2xl font-bold">234</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <Stethoscope className="text-orange-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Especialidad</p>
              <p className="text-2xl font-bold">Cardiología</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Citas de Hoy</h2>
            <div className="space-y-3">
              {[
                { time: '09:00', patient: 'Juan Pérez', reason: 'Control cardiológico' },
                { time: '10:30', patient: 'María García', reason: 'Consulta general' },
                { time: '11:15', patient: 'Carlos López', reason: 'Seguimiento' },
                { time: '14:00', patient: 'Ana Martínez', reason: 'Revisión' },
                { time: '15:30', patient: 'Luis Rodríguez', reason: 'Primera consulta' }
              ].map((appointment, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{appointment.patient}</p>
                      <p className="text-sm text-gray-600">{appointment.reason}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-blue-600">{appointment.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
            <div className="space-y-3">
              <button className="w-full btn btn-primary text-left">
                Nueva Consulta
              </button>
              <button className="w-full btn btn-secondary text-left">
                Ver Pacientes
              </button>
              <button className="w-full btn btn-secondary text-left">
                Programar Cita
              </button>
              <button className="w-full btn btn-secondary text-left">
                Ver Historial
              </button>
            </div>
          </div>

          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4">Pacientes Recientes</h2>
            <div className="space-y-2">
              {['Juan Pérez', 'María García', 'Carlos López'].map((patient, i) => (
                <div key={i} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Stethoscope size={12} className="text-green-600" />
                  </div>
                  <span className="text-sm">{patient}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicoDashboard
