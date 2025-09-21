import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/Dashboard";
import MedicoDashboard from "./pages/medico/Dashboard";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

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
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/admin/*"
          element={
            <Protected roles={["ADMIN_GLOBAL"]}>
              <AdminDashboard />
            </Protected>
          }
        />

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
