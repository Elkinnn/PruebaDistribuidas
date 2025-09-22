import { Pencil, Trash2 } from "lucide-react";

export default function HospitalTable({ items = [], onEdit, onDelete }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
                <colgroup>
                    <col className="w-[18%]" />
                    <col className="w-[25%]" /> 
                    <col className="w-[12%]" /> 
                    <col className="w-[25%]" />
                    <col className="w-[10%]" /> 
                    <col className="w-[10%]" /> 
                </colgroup>

                <thead>
                    <tr className="bg-slate-50 text-left text-slate-700">
                        <th className="px-4 py-3 font-semibold">Nombre</th>
                        <th className="px-4 py-3 font-semibold">Dirección</th>
                        <th className="px-4 py-3 font-semibold">Teléfono</th>
                        <th className="px-4 py-3 font-semibold">Especialidades</th>
                        <th className="px-4 py-3 font-semibold">Estado</th>
                        <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-800">
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                                No hay hospitales.
                            </td>
                        </tr>
                    ) : (
                        items.map((h, i) => (
                            <tr key={h.id ?? i} className={i % 2 ? "bg-white" : "bg-slate-50/40"}>
                                {/* Nombre: 1 línea */}
                                <td className="px-4 py-3 font-semibold">
                                    <div className="truncate" title={h.nombre}>
                                        {h.nombre}
                                    </div>
                                </td>

                                {/* Dirección: 2 líneas máx + rompe palabras largas */}
                                <td className="px-4 py-3">
                                    <p className="line-clamp-2 break-words text-slate-700" title={h.direccion || "-"}>
                                        {h.direccion || "-"}
                                    </p>
                                </td>

                                {/* Teléfono: 1 línea */}
                                <td className="px-4 py-3">
                                    <div className="truncate" title={h.telefono || "-"}>
                                        {h.telefono || "-"}
                                    </div>
                                </td>

                                {/* Especialidades: badges */}
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {h.especialidades && h.especialidades.length > 0 ? (
                                            h.especialidades.slice(0, 3).map((esp, idx) => (
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
                                        {h.especialidades && h.especialidades.length > 3 && (
                                            <span className="text-xs text-slate-500">
                                                +{h.especialidades.length - 3} más
                                            </span>
                                        )}
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${h.activo
                                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                                : "bg-slate-100 text-slate-600 ring-slate-300"
                                            }`}
                                    >
                                        {h.activo ? "Activo" : "Inactivo"}
                                    </span>
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onEdit?.(h)}
                                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                                            title="Editar"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => onDelete?.(h)}
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
