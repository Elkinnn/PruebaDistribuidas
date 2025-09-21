import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Logo from "../components/ui/Logo";
import { loginRequest } from "../api/auth";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const emailError =
    touched && !/^\S+@\S+\.\S+$/.test(email) ? "Correo inválido" : "";
  const pwdError = touched && password.length < 6 ? "Mínimo 6 caracteres" : "";
  const formInvalid = !!emailError || !!pwdError || !email || !password;

  async function onSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (formInvalid) return;

    try {
      setLoading(true);
      setServerError("");
      const { token, user } = await loginRequest({ email, password });

      localStorage.setItem("clinix_token", token);
      localStorage.setItem("clinix_user", JSON.stringify(user));

      if (user?.rol === "ADMIN_GLOBAL") nav("/admin");
      else if (user?.rol === "MEDICO") nav("/medico");
      else nav("/");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "No se pudo iniciar sesión. Revisa tus credenciales.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-indigo-50">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-12 px-6 py-10 md:grid-cols-2">
        {/* Lado izquierdo: texto */}
        <div className="hidden md:block">
          <Logo className="mb-6" />
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Bienvenido a Clinix
          </h1>
          <p className="mt-3 max-w-md text-slate-600">
            Plataforma de gestión hospitalaria para administradores y médicos.
            Seguridad, trazabilidad y agilidad en cada atención.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
              <p className="mb-1 text-sm font-semibold text-emerald-700">
                Citas y pacientes
              </p>
              <p className="text-sm text-slate-600">
                Agenda, estado y seguimiento clínico en tiempo real.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
              <p className="mb-1 text-sm font-semibold text-emerald-700">
                Centros y personal
              </p>
              <p className="text-sm text-slate-600">
                Administra hospitales, especialidades, médicos y empleados.
              </p>
            </div>
          </div>
        </div>

        {/* Card de Login */}
        <Card className="mx-auto w-full max-w-md backdrop-blur-sm">
          <div className="border-b border-slate-200/70 p-6">
            <div className="flex items-center justify-between">
              <Logo />
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                Acceso seguro
              </span>
            </div>
          </div>

          <form className="grid gap-4 p-6" onSubmit={onSubmit} noValidate>
            <Input
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              placeholder="tu-correo@clinix.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              error={emailError}
            />

            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Contraseña
                </span>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-emerald-700 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched(true)}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute inset-y-0 right-2 my-auto rounded-md px-2 text-xs text-slate-500 hover:bg-slate-100"
                >
                  {showPwd ? "Ocultar" : "Ver"}
                </button>
              </div>
              {pwdError ? (
                <span className="text-xs text-rose-600">{pwdError}</span>
              ) : null}
            </div>

            {serverError ? (
              <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
                {serverError}
              </div>
            ) : null}

            <Button type="submit" disabled={formInvalid || loading} loading={loading}>
              Ingresar
            </Button>

            <p className="text-center text-xs text-slate-500">
              Al continuar aceptas las políticas de seguridad de Clinix.
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
