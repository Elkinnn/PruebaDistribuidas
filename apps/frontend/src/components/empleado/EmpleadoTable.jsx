import { Pencil, Trash2 } from "lucide-react";

export default function EmpleadoTable({
    items = [],
    hospitalMap = {},
    onEdit,
    onDelete,
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full table-fixed border-separate border-spacing-0 text-left text-sm">
                    <thead className="bg-slate-50 text-slate-700">
                        <tr>
                            <th className="w-[20%] px-4 py-3 font-semibold">Nombres</th>
                            <th className="w-[20%] px-4 py-3 font-semibold">Apellidos</th>
                            <th className="w-[20%] px-4 py-3 font-semibold">Hospital</th>
                            <th className="w-[12%] px-4 py-3 font-semibold">Tipo</th>
                            <th className="w-[20%] px-4 py-3 font-semibold">Contacto</th>
                            <th className="w-[4%]  px-4 py-3 font-semibold">Estado</th>
                            <th className="w-[4%]  px-4 py-3 text-right font-semibold">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="text-slate-800">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                                    No hay empleados.
                                </td>
                            </tr>
                        ) : (
                            items.map((e, i) => (
                                <tr key={e.id ?? i} className={i % 2 ? "bg-white" : "bg-slate-50/40"}>
                                    {/* Nombres */}
                                    <td className="max-w-0 px-4 py-3 font-medium">
                                        <span className="block truncate whitespace-nowrap" title={e.nombres}>
                                            {e.nombres}
                                        </span>
                                    </td>

                                    {/* Apellidos */}
                                    <td className="max-w-0 px-4 py-3">
                                        <span className="block truncate whitespace-nowrap" title={e.apellidos}>
                                            {e.apellidos}
                                        </span>
                                    </td>

                                    {/* Hospital */}
                                    <td className="max-w-0 px-4 py-3">
                                        <span
                                            className="block truncate whitespace-nowrap"
                                            title={hospitalMap[e.hospitalId] || "-"}
                                        >
                                            {hospitalMap[e.hospitalId] || "-"}
                                        </span>
                                    </td>

                                    {/* Tipo */}
                                    <td className="max-w-0 px-4 py-3">
                                        <span className="block truncate whitespace-nowrap" title={e.tipo || "-"}>
                                            {e.tipo || "-"}
                                        </span>
                                    </td>

                                    {/* Contacto (dos líneas, cada una truncada) */}
                                    <td className="max-w-0 px-4 py-3">
                                        <div className="space-y-0.5">
                                            <span className="block truncate text-slate-700" title={e.email || "-"}>
                                                {e.email || "-"}
                                            </span>
                                            <span className="block truncate text-slate-700" title={e.telefono || "-"}>
                                                {e.telefono || "-"}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Estado */}
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${e.activo
                                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                                    : "bg-slate-100 text-slate-600 ring-slate-300"
                                                }`}
                                        >
                                            {e.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>

                                    {/* Acciones */}
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
        </div>
    );
}
