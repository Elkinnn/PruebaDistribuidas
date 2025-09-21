import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { logoutMedico } from "../../api/auth.medico";

export default function MedicoLayout() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("clinix_token_medico");
    const userData = localStorage.getItem("clinix_user_medico");
    
    if (token && userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        // En modo mock, no necesitamos verificar con el servidor
        setLoading(false);
      } catch (error) {
        // Datos corruptos, limpiar y redirigir
        logoutMedico();
        nav("/medico/login");
      }
    } else {
      setLoading(false);
    }
  }, [nav]);

  function handleLogout() {
    logoutMedico();
    nav("/medico/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-sm text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    nav("/medico/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/medico" className="text-xl font-bold text-emerald-600">
                Clinix Médico
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-600">
                <span className="font-medium">{user.nombre}</span>
                <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  {user.especialidad}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="space-y-2">
              <Link
                to="/medico"
                className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                Dashboard
              </Link>
              
              <Link
                to="/medico/citas"
                className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Citas
              </Link>
              
              <Link
                to="/medico/especialidades"
                className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Especialidades
              </Link>
              
              <Link
                to="/medico/perfil"
                className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Perfil
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}