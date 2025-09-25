// apps/frontend/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

// ADMIN (ya existente)
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Hospitales from "./pages/admin/Hospitales";
import Especialidades from "./pages/admin/Especialidades";
import Medicos from "./pages/admin/Medicos";
import CitasAdmin from "./pages/admin/Citas";
import Empleados from "./pages/admin/Empleados";
import AdminLogin from "./pages/admin/Login"; // login del admin que ya tienen


// MÉDICO (independiente)
import MedicoLayout from "./pages/medico/MedicoLayout";
import MedicoHome from "./pages/medico/Home";
import MedicoCitas from "./pages/medico/Citas";
import MedicoEspecialidades from "./pages/medico/Especialidades";
import MedicoPerfil from "./pages/medico/Perfil";
import MedicoLogin from "./pages/medico/Login";

// Guards
function AdminProtected({ children }) {
  const token = localStorage.getItem("clinix_token");
  // Protección de rutas según rol
  function Protected({ roles, children }) {
    const token = localStorage.getItem("authToken");
    const user = JSON.parse(localStorage.getItem("clinix_user") || "null");
    if (!token || !user || user?.rol !== "ADMIN_GLOBAL") return <Navigate to="/admin/login" replace />;
    return children;
  }

  function MedicoProtected({ children }) {
    const token = localStorage.getItem("clinix_token_medico");
    const user = JSON.parse(localStorage.getItem("clinix_user_medico") || "null");
    if (!token || !user || user?.rol !== "MEDICO") return <Navigate to="/medico/login" replace />;
    return children;
  }
}
  export default function App() {
    return (
      <Routes>
        {/* Público del ADMIN */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />


        {/* ADMIN protegido */}
        <Route
          path="/admin"
          element={
            <AdminProtected>
              <AdminLayout />
            </AdminProtected>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="hospitales" element={<Hospitales />} />
          <Route path="especialidades" element={<Especialidades />} />
          <Route path="medicos" element={<Medicos />} />
          <Route path="citas" element={<CitasAdmin />} />
          <Route path="empleados" element={<Empleados />} />
        </Route>

        {/* MÉDICO: login propio + área protegida */}
        <Route path="/medico/login" element={<MedicoLogin />} />
        <Route
          path="/medico/*"
          element={
            <MedicoProtected>
              <MedicoLayout />
            </MedicoProtected>
          }
        >
          <Route index element={<MedicoHome />} />
          <Route path="citas" element={<MedicoCitas />} />
          <Route path="especialidades" element={<MedicoEspecialidades />} />
          <Route path="perfil" element={<MedicoPerfil />} />
        </Route>
      </Routes>
    );
  }

