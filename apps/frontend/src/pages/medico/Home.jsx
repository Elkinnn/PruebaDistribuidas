import { Link } from "react-router-dom";
export default function Home(){
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-xl font-semibold text-slate-900">Bienvenido</h1>
      <p className="mt-1 text-sm text-slate-600">Usa el menú para gestionar tus citas.</p>
      <div className="mt-4">
        <Link className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white" to="/medico/citas">
          Ir a Citas
        </Link>
      </div>
    </div>
  );
}
