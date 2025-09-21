import { Pencil, Trash2 } from "lucide-react";

export default function HospitalTable({ rows, onEdit, onDelete }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-700">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Nombre</th>
                            <th className="px-4 py-3 font-semibold">Dirección</th>
                            <th className="px-4 py-3 font-semibold">Teléfono</th>
                            <th className="px-4 py-3 font-semibold">Estado</th>
                            <th className="px-4 py-3 font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                    No hay hospitales.
                                </td>
                            </tr>
                        ) : (
                            rows.map((h) => (
                                <tr key={h.id} className="hover:bg-slate-50/60">
                                    <td className="px-4 py-2.5 font-medium text-slate-900">{h.nombre}</td>
                                    <td className="px-4 py-2.5 text-slate-700">{h.direccion || "-"}</td>
                                    <td className="px-4 py-2.5 text-slate-700">{h.telefono || "-"}</td>
                                    <td className="px-4 py-2.5">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${h.activo
                                                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                                    : "bg-slate-100 text-slate-600 ring-1 ring-slate-300"
                                                }`}
                                        >
                                            {h.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onEdit(h)}
                                                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(h)}
                                                className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
