import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import MedicoDashboard from "./pages/medico/Dashboard";
import AdminLogin from "./pages/admin/Login";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Hospitales from "./pages/admin/Hospitales";
import Especialidades from "./pages/admin/Especialidades";
import Medicos from "./pages/admin/Medicos";
import Citas from "./pages/admin/Citas";
import Empleados from "./pages/admin/Empleados";

// Protección de rutas según rol
function Protected({ roles, children }) {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("clinix_user") || "null");

  if (!token || !user) return <Navigate to="/admin/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin"
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

      <Route
        path="/medico/*"
        element={
          <Protected roles={["MEDICO"]}>
            <MedicoDashboard />
          </Protected>
        }
      />
    </Routes>
  );
}
