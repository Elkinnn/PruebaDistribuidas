import { Pencil, Trash2 } from "lucide-react";

export default function CitaTable({
    items = [],
    medicoMap = {},
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
                            <th className="w-[20%] px-4 py-3 font-semibold">Paciente</th>
                            <th className="w-[12%] px-4 py-3 font-semibold">Documento</th>
                            <th className="w-[16%] px-4 py-3 font-semibold">Hospital</th>
                            <th className="w-[16%] px-4 py-3 font-semibold">Médico</th>
                            <th className="w-[20%] px-4 py-3 font-semibold">Fecha</th>
                            <th className="w-[10%] px-4 py-3 font-semibold">Motivo</th>
                            <th className="w-[6%]  px-4 py-3 font-semibold">Estado</th>
                            <th className="w-[6%]  px-4 py-3 text-right font-semibold">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 text-slate-800">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                                    No hay citas.
                                </td>
                            </tr>
                        ) : (
                            items.map((c, i) => {
                                // Soporta c.paciente (objeto o string) y c.pacienteInfo
                                const pObj =
                                    typeof c.paciente === "object" && c.paciente
                                        ? c.paciente
                                        : c.pacienteInfo && typeof c.pacienteInfo === "object"
                                            ? c.pacienteInfo
                                            : null;

                                const fullName = pObj
                                    ? `${pObj.nombres || ""} ${pObj.apellidos || ""}`.trim()
                                    : typeof c.paciente === "string"
                                        ? c.paciente
                                        : "-";

                                const documento = pObj?.documento || "-";
                                const medico = medicoMap[c.medicoId] || "-";
                                const hospital = hospitalMap?.[c.hospitalId] || "-";
                                const fechaTxt =
                                    c.fechaInicio && c.fechaFin
                                        ? `${new Date(c.fechaInicio).toLocaleString()} — ${new Date(
                                            c.fechaFin
                                        ).toLocaleString()}`
                                        : c.fechaInicio
                                            ? new Date(c.fechaInicio).toLocaleString()
                                            : "-";

                                return (
                                    <tr
                                        key={c.id ?? i}
                                        className={i % 2 ? "bg-white" : "bg-slate-50/40"}
                                    >
                                        <td className="max-w-0 px-4 py-3 font-medium">
                                            <span
                                                className="block truncate whitespace-nowrap"
                                                title={fullName}
                                            >
                                                {fullName}
                                            </span>
                                        </td>

                                        <td className="max-w-0 px-4 py-3">
                                            <span
                                                className="block truncate whitespace-nowrap"
                                                title={documento}
                                            >
                                                {documento}
                                            </span>
                                        </td>

                                        <td className="max-w-0 px-4 py-3">
                                            <span className="block truncate whitespace-nowrap" title={hospital}>
                                                {hospital}
                                            </span>
                                        </td>

                                        <td className="max-w-0 px-4 py-3">
                                            <span className="block truncate whitespace-nowrap" title={medico}>
                                                {medico}
                                            </span>
                                        </td>

                                        <td className="max-w-0 px-4 py-3">
                                            <span className="block truncate whitespace-nowrap" title={fechaTxt}>
                                                {fechaTxt}
                                            </span>
                                        </td>

                                        <td className="max-w-0 px-4 py-3">
                                            <span
                                                className="block truncate whitespace-nowrap"
                                                title={c.motivo || "-"}
                                            >
                                                {c.motivo || "-"}
                                            </span>
                                        </td>

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
                                                {c.estado
                                                    ? c.estado.charAt(0).toUpperCase() + c.estado.slice(1)
                                                    : "-"}
                                            </span>
                                        </td>

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
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
