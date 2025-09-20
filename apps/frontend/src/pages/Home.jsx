import { Link } from 'react-router-dom'
import { Users, Stethoscope, Shield, Database } from 'lucide-react'

const Home = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bienvenido a la Aplicación Distribuida
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sistema de gestión con arquitectura hexagonal y microservicios
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold">Gateway</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Punto de entrada único para todas las peticiones
          </p>
          <div className="text-sm text-green-600 font-medium">✓ Activo</div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold">Admin Service</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Gestión de administradores y configuración
          </p>
          <Link to="/admin" className="btn btn-primary">
            Acceder
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Stethoscope className="text-purple-600" size={24} />
            <h3 className="text-lg font-semibold">Medico Service</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Gestión de médicos y pacientes
          </p>
          <Link to="/medico" className="btn btn-primary">
            Acceder
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="text-orange-600" size={24} />
            <h3 className="text-lg font-semibold">Database</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Base de datos compartida con Prisma
          </p>
          <div className="text-sm text-green-600 font-medium">✓ Conectado</div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Arquitectura del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Frontend (React)</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Interfaz de usuario moderna</li>
              <li>• React Router para navegación</li>
              <li>• React Query para estado del servidor</li>
              <li>• Componentes reutilizables</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Backend (Node.js)</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Arquitectura hexagonal</li>
              <li>• Separación de responsabilidades</li>
              <li>• Microservicios independientes</li>
              <li>• API RESTful</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Infraestructura</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• API Gateway centralizado</li>
              <li>• Base de datos con Prisma</li>
              <li>• Monorepo con workspaces</li>
              <li>• Desarrollo local integrado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
