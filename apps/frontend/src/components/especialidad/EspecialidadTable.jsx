import { Pencil, Trash2, Stethoscope, FileText } from "lucide-react";

export default function EspecialidadTable({ items, rows, onEdit, onDelete }) {
    const data = Array.isArray(items) ? items : Array.isArray(rows) ? rows : [];

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full table-fixed border-separate border-spacing-0 text-left text-sm">
                <colgroup>
                    <col className="w-[30%]" /> 
                    <col className="w-[55%]" /> 
                    <col className="w-[15%]" />
                </colgroup>

                <thead className="bg-slate-50 text-slate-700">
                    <tr>
                        <th className="px-4 py-3 font-semibold">Nombre</th>
                        <th className="px-4 py-3 font-semibold">Descripción</th>
                        <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-800">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="px-4 py-10 text-center text-slate-500">
                                No hay especialidades.
                            </td>
                        </tr>
                    ) : (
                        data.map((e, i) => (
                            <tr key={e.id ?? i} className={i % 2 ? "bg-white" : "bg-slate-50/40"}>
                                {/* Nombre: 1 línea */}
                                <td className="px-4 py-3 font-medium text-slate-900">
                                    <div className="flex items-center gap-2">
                                        <Stethoscope size={16} className="text-slate-400" />
                                        <div className="truncate" title={e.nombre}>
                                            {e.nombre}
                                        </div>
                                    </div>
                                </td>

                                {/* Descripción: 2 líneas máx */}
                                <td className="px-4 py-3">
                                    <div className="flex items-start gap-2">
                                        <FileText size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                        <p className="line-clamp-2 break-words text-slate-700" title={e.descripcion || "-"}>
                                            {e.descripcion || "-"}
                                        </p>
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onEdit?.(e)}
                                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                                            title="Editar"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => onDelete?.(e)}
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
    );
}
