import { Routes, Route } from 'react-router-dom'
import { Users, Settings, BarChart3, Plus } from 'lucide-react'

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <button className="btn btn-primary flex items-center space-x-2">
          <Plus size={16} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <Users className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold">1,234</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <BarChart3 className="text-green-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Activos Hoy</p>
              <p className="text-2xl font-bold">89</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <Settings className="text-purple-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Configuraciones</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Usuarios Recientes</h2>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Usuario {i}</p>
                      <p className="text-sm text-gray-600">usuario{i}@email.com</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Activo</span>
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
                Crear Usuario
              </button>
              <button className="w-full btn btn-secondary text-left">
                Configurar Sistema
              </button>
              <button className="w-full btn btn-secondary text-left">
                Ver Reportes
              </button>
              <button className="w-full btn btn-secondary text-left">
                Exportar Datos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
