import { Pencil, Trash2 } from "lucide-react";

export default function HospitalTable({ items, onEdit, onDelete }) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full border-separate border-spacing-0">
                <thead>
                    <tr className="bg-slate-50 text-left text-sm text-slate-600">
                        <th className="px-4 py-3 font-medium">Nombre</th>
                        <th className="px-4 py-3 font-medium">Dirección</th>
                        <th className="px-4 py-3 font-medium">Teléfono</th>
                        <th className="px-4 py-3 font-medium">Estado</th>
                        <th className="px-4 py-3 text-right font-medium">Acciones</th>
                    </tr>
                </thead>
                <tbody className="text-slate-800">
                    {items.map((h, i) => (
                        <tr
                            key={h.id}
                            className={`text-sm ${i % 2 ? "bg-white" : "bg-slate-50/40"}`}
                        >
                            <td className="px-4 py-4 font-semibold">{h.nombre}</td>
                            <td className="px-4 py-4">
                                <p className="line-clamp-2 text-slate-700">{h.direccion || "-"}</p>
                            </td>
                            <td className="px-4 py-4">{h.telefono || "-"}</td>
                            <td className="px-4 py-4">
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${h.activo
                                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                            : "bg-slate-100 text-slate-600 ring-slate-300"
                                        }`}
                                >
                                    {h.activo ? "Activo" : "Inactivo"}
                                </span>
                            </td>
                            <td className="px-4 py-4">
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
                    ))}

                    {items.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                                No hay hospitales.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
