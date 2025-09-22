import { Pencil, Trash2 } from "lucide-react";

export default function MedicoTable({ items = [], hospitalMap = {}, onEdit, onDelete }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full table-fixed border-separate border-spacing-0 text-left text-sm">
                    <thead className="bg-slate-50 text-slate-700">
                        <tr>
                            <th className="w-[30%] px-4 py-3 font-semibold">Médico</th>
                            <th className="w-[30%] px-4 py-3 font-semibold">Hospital</th>
                            <th className="w-[25%] px-4 py-3 font-semibold">Email</th>
                            <th className="w-[7%]  px-4 py-3 font-semibold">Estado</th>
                            <th className="w-[8%]  px-4 py-3 text-right font-semibold">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 text-slate-800">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                                    No hay médicos.
                                </td>
                            </tr>
                        ) : (
                            items.map((m, i) => (
                                <tr key={m.id ?? i} className={i % 2 ? "bg-white" : "bg-slate-50/40"}>
                                    {/* Médico */}
                                    <td className="max-w-0 px-4 py-3 font-medium">
                                        <div className="truncate whitespace-nowrap" title={`${m.nombres} ${m.apellidos}`}>
                                            {m.nombres} {m.apellidos}
                                        </div>
                                    </td>

                                    {/* Hospital */}
                                    <td className="max-w-0 px-4 py-3">
                                        <div className="truncate whitespace-nowrap" title={hospitalMap[m.hospitalId] || "-"}>
                                            {hospitalMap[m.hospitalId] || "-"}
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td className="max-w-0 px-4 py-3">
                                        <div className="truncate whitespace-nowrap" title={m.email || "-"}>
                                            {m.email || "-"}
                                        </div>
                                    </td>

                                    {/* Estado */}
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${m.activo
                                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                                    : "bg-slate-100 text-slate-600 ring-slate-300"
                                                }`}
                                        >
                                            {m.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onEdit?.(m)}
                                                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                                                title="Editar"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => onDelete?.(m)}
                                                className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
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
