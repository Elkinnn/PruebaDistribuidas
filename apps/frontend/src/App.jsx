import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import Hospitales from "./pages/admin/Hospitales";
import Especialidades from "./pages/admin/Especialidades";
import Medicos from "./pages/admin/Medicos";
import Citas from "./pages/admin/Citas";
import Empleados from "./pages/admin/Empleados";

// Médico
import MedicoLayout from "./pages/medico/MedicoLayout";
import MedicoHome from "./pages/medico/Home";
import MedicoCitas from "./pages/medico/Citas";
import MedicoEspecialidades from "./pages/medico/Especialidades";
import MedicoPerfil from "./pages/medico/Perfil";

// Protección de rutas según rol
function Protected({ roles, children }) {
  const token = localStorage.getItem("clinix_token");
  const user = JSON.parse(localStorage.getItem("clinix_user") || "null");

  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin */}
      <Route
        path="/admin/*"
        element={
          <Protected roles={["ADMIN_GLOBAL"]}>
            <AdminLayout />
          </Protected>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="hospitales" element={<Hospitales />} />
        <Route path="especialidades" element={<Especialidades />} />
        <Route path="medicos" element={<Medicos />} />
        <Route path="citas" element={<Citas />} />
        <Route path="empleados" element={<Empleados />} />
      </Route>

      {/* Médico */}
      <Route
        path="/medico/*"
        element={
          <Protected roles={["MEDICO"]}>
            <MedicoLayout />
          </Protected>
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
