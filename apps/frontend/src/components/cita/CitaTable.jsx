import { Pencil, Trash2 } from "lucide-react";

export default function CitaTable({
    items = [],
    medicoMap = {},
    onEdit,
    onDelete,
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full table-fixed border-separate border-spacing-0 text-left text-sm">
                    <thead className="bg-slate-50 text-slate-700">
                        <tr>
                            <th className="w-[28%] px-4 py-3 font-semibold">Paciente</th>
                            <th className="w-[28%] px-4 py-3 font-semibold">Médico</th>
                            <th className="w-[18%] px-4 py-3 font-semibold">Fecha y hora</th>
                            <th className="w-[18%] px-4 py-3 font-semibold">Motivo</th>
                            <th className="w-[4%]  px-4 py-3 font-semibold">Estado</th>
                            <th className="w-[4%]  px-4 py-3 text-right font-semibold">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 text-slate-800">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                                    No hay citas.
                                </td>
                            </tr>
                        ) : (
                            items.map((c, i) => (
                                <tr key={c.id ?? i} className={i % 2 ? "bg-white" : "bg-slate-50/40"}>
                                    {/* Paciente */}
                                    <td className="max-w-0 px-4 py-3 font-medium">
                                        <span className="block truncate whitespace-nowrap" title={c.paciente}>
                                            {c.paciente}
                                        </span>
                                    </td>

                                    {/* Médico */}
                                    <td className="max-w-0 px-4 py-3">
                                        <span
                                            className="block truncate whitespace-nowrap"
                                            title={medicoMap[c.medicoId] || "-"}
                                        >
                                            {medicoMap[c.medicoId] || "-"}
                                        </span>
                                    </td>

                                    {/* Fecha */}
                                    <td className="max-w-0 px-4 py-3">
                                        <span
                                            className="block truncate whitespace-nowrap"
                                            title={c.fechaHora}
                                        >
                                            {new Date(c.fechaHora).toLocaleString()}
                                        </span>
                                    </td>

                                    {/* Motivo */}
                                    <td className="max-w-0 px-4 py-3">
                                        <span className="block truncate whitespace-nowrap" title={c.motivo || "-"}>
                                            {c.motivo || "-"}
                                        </span>
                                    </td>

                                    {/* Estado */}
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${c.estado === "cancelada"
                                                    ? "bg-rose-50 text-rose-700 ring-rose-200"
                                                    : c.estado === "confirmada"
                                                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                                        : "bg-amber-50 text-amber-700 ring-amber-200"
                                                }`}
                                            title={c.estado}
                                        >
                                            {c.estado?.charAt(0).toUpperCase() + c.estado?.slice(1)}
                                        </span>
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onEdit?.(c)}
                                                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                                                title="Editar"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => onDelete?.(c)}
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
