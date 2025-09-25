import { Pencil, Trash2, User, Building2, Stethoscope, Mail, Phone } from "lucide-react";

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
                            <th className="w-[30%] px-4 py-3 font-semibold">Empleado</th>
                            <th className="w-[25%] px-4 py-3 font-semibold">Hospital</th>
                            <th className="w-[15%] px-4 py-3 font-semibold">Tipo</th>
                            <th className="w-[24%] px-4 py-3 font-semibold">Contacto</th>
                            <th className="w-[6%]  px-4 py-3 text-right font-semibold">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="text-slate-800">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                                    No hay empleados.
                                </td>
                            </tr>
                        ) : (
                            items.map((e, i) => (
                                <tr key={e.id ?? i} className={i % 2 ? "bg-white" : "bg-slate-50/40"}>
                                    {/* Empleado (Nombres + Apellidos) */}
                                    <td className="max-w-0 px-4 py-3 font-medium">
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-slate-500 flex-shrink-0" />
                                            <span className="block truncate whitespace-nowrap" title={`${e.nombres} ${e.apellidos}`}>
                                                {e.nombres} {e.apellidos}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Hospital */}
                                    <td className="max-w-0 px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={16} className="text-slate-500 flex-shrink-0" />
                                            <span
                                                className="block truncate whitespace-nowrap"
                                                title={hospitalMap[e.hospitalId] || "-"}
                                            >
                                                {hospitalMap[e.hospitalId] || "-"}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Tipo */}
                                    <td className="max-w-0 px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Stethoscope size={16} className="text-slate-500 flex-shrink-0" />
                                            <span className="block truncate whitespace-nowrap" title={e.tipo || "-"}>
                                                {e.tipo || "-"}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Contacto (dos líneas, cada una truncada) */}
                                    <td className="max-w-0 px-4 py-3">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="text-slate-500 flex-shrink-0" />
                                                <span className="block truncate text-slate-700" title={e.email || "-"}>
                                                    {e.email || "-"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="text-slate-500 flex-shrink-0" />
                                                <span className="block truncate text-slate-700" title={e.telefono || "-"}>
                                                    {e.telefono || "-"}
                                                </span>
                                            </div>
                                        </div>
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
