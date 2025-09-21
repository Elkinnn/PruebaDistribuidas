import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Logo from "../../components/ui/Logo";
import { logoutMedico } from "../../api/auth.medico";

export default function MedicoDashboard() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("clinix_user_medico") || "null");

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="mx-auto flex max-w-5xl items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>{user?.nombre} - {user?.especialidad}</span>
          <Button
            className="bg-slate-700 hover:bg-slate-800"
            onClick={() => {
              logoutMedico();
              nav("/medico/login", { replace: true });
            }}
          >
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-5xl">
        <h1 className="text-2xl font-semibold text-slate-900">
          Panel Médico (Clinix)
        </h1>
        <p className="mt-2 text-slate-600">
          Bienvenido Dr. {user?.nombre}, especialista en {user?.especialidad}.
        </p>
        <p className="mt-2 text-slate-600">
          Aquí podrás gestionar tus citas, pacientes y especialidades.
        </p>
      </main>
    </div>
  );
}
