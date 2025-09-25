import { Pencil, Trash2, Stethoscope, Building2, Mail } from "lucide-react";

export default function MedicoTable({ items = [], hospitalMap = {}, onEdit, onDelete }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full table-fixed border-separate border-spacing-0 text-left text-sm">
                    <thead className="bg-slate-50 text-slate-700">
                        <tr>
                            <th className="w-[25%] px-4 py-3 font-semibold">Médico</th>
                            <th className="w-[25%] px-4 py-3 font-semibold">Hospital</th>
                            <th className="w-[20%] px-4 py-3 font-semibold">Email</th>
                            <th className="w-[25%] px-4 py-3 font-semibold">Especialidades</th>
                            <th className="w-[5%]  px-4 py-3 text-right font-semibold">Acciones</th>
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
                                        <div className="flex items-center gap-2">
                                            <Stethoscope size={16} className="text-slate-400" />
                                            <div className="truncate whitespace-nowrap" title={`${m.nombres} ${m.apellidos}`}>
                                                {m.nombres} {m.apellidos}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Hospital */}
                                    <td className="max-w-0 px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={16} className="text-slate-400" />
                                            <div className="truncate whitespace-nowrap" title={hospitalMap[m.hospitalId] || "-"}>
                                                {hospitalMap[m.hospitalId] || "-"}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td className="max-w-0 px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} className="text-slate-400" />
                                            <div className="truncate whitespace-nowrap" title={m.email || "-"}>
                                                {m.email || "-"}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Especialidades */}
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {m.especialidades && m.especialidades.length > 0 ? (
                                                m.especialidades.slice(0, 2).map((esp, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200"
                                                    >
                                                        {esp.nombre}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-400">Sin especialidades</span>
                                            )}
                                            {m.especialidades && m.especialidades.length > 2 && (
                                                <span className="text-xs text-slate-500">
                                                    +{m.especialidades.length - 2} más
                                                </span>
                                            )}
                                        </div>
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
