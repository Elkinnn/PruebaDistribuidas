import { useEffect, useMemo, useState } from "react";
import Modal from "../../components/ui/Modal";
import { Check } from "lucide-react";

const empty = {
    paciente: "",
    medicoId: "",
    fechaHora: "",
    motivo: "",
    estado: "pendiente", // pendiente | confirmada | cancelada
};

export default function CitaForm({
    open,
    onClose,
    onSubmit,
    initialData,
    medicos = [],
    serverError = "",
}) {
    const [values, setValues] = useState(empty);
    const [touched, setTouched] = useState({});
    const isEdit = !!initialData?.id;

    useEffect(() => {
        setValues(
            initialData
                ? {
                    id: initialData.id,
                    paciente: initialData.paciente || "",
                    medicoId: String(initialData.medicoId ?? "") || "",
                    fechaHora: initialData.fechaHora
                        ? new Date(initialData.fechaHora).toISOString().slice(0, 16) // a datetime-local
                        : "",
                    motivo: initialData.motivo || "",
                    estado: initialData.estado || "pendiente",
                }
                : empty
        );
        setTouched({});
    }, [initialData, open]);

    const errors = useMemo(() => {
        const e = {};
        if (!values.paciente?.trim()) e.paciente = "El paciente es obligatorio.";
        if (!values.medicoId) e.medicoId = "Selecciona un médico.";
        if (!values.fechaHora) e.fechaHora = "La fecha y hora son obligatorias.";
        return e;
    }, [values]);

    const isInvalid =
        Object.keys(errors).length > 0 ||
        !values.paciente?.trim() ||
        !values.medicoId ||
        !values.fechaHora;

    const setField = (k, v) => setValues((s) => ({ ...s, [k]: v }));
    const markAllTouched = () =>
        setTouched({ paciente: true, medicoId: true, fechaHora: true, motivo: true, estado: true });

    const handleSubmit = (e) => {
        e.preventDefault();
        markAllTouched();
        if (isInvalid) return;

        // Convertimos datetime-local a ISO
        const payload = {
            ...values,
            medicoId: Number(values.medicoId),
            fechaHora: new Date(values.fechaHora).toISOString(),
        };
        onSubmit?.(payload);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? "Editar cita" : "Nueva cita"}
            size="lg"
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="cita-form"
                        disabled={isInvalid}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white ${isInvalid ? "cursor-not-allowed bg-emerald-300" : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                    >
                        <Check size={16} /> Guardar
                    </button>
                </>
            }
        >
            <form id="cita-form" onSubmit={handleSubmit} className="space-y-5">
                {serverError ? (
                    <div className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700 ring-1 ring-rose-200">
                        {serverError}
                    </div>
                ) : null}

                {/* Paciente */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Paciente <span className="text-rose-600">*</span>
                    </label>
                    <input
                        className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${touched.paciente && errors.paciente
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                            }`}
                        placeholder="Ej: Juan Pérez"
                        value={values.paciente}
                        onBlur={() => setTouched((t) => ({ ...t, paciente: true }))}
                        onChange={(e) => setField("paciente", e.target.value)}
                    />
                    {touched.paciente && errors.paciente ? (
                        <p className="mt-1 text-xs text-rose-600">{errors.paciente}</p>
                    ) : null}
                </div>

                {/* Médico */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Médico <span className="text-rose-600">*</span>
                    </label>
                    <select
                        className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-4 ${touched.medicoId && errors.medicoId
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                            }`}
                        value={values.medicoId}
                        onBlur={() => setTouched((t) => ({ ...t, medicoId: true }))}
                        onChange={(e) => setField("medicoId", e.target.value)}
                    >
                        <option value="">Selecciona…</option>
                        {medicos.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.nombres} {m.apellidos}
                            </option>
                        ))}
                    </select>
                    {touched.medicoId && errors.medicoId ? (
                        <p className="mt-1 text-xs text-rose-600">{errors.medicoId}</p>
                    ) : null}
                </div>

                {/* Fecha y hora */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Fecha y hora <span className="text-rose-600">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-4 ${touched.fechaHora && errors.fechaHora
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                            }`}
                        value={values.fechaHora}
                        onBlur={() => setTouched((t) => ({ ...t, fechaHora: true }))}
                        onChange={(e) => setField("fechaHora", e.target.value)}
                    />
                    {touched.fechaHora && errors.fechaHora ? (
                        <p className="mt-1 text-xs text-rose-600">{errors.fechaHora}</p>
                    ) : null}
                </div>

                {/* Motivo */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Motivo</label>
                    <textarea
                        rows={3}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                        placeholder="Detalle breve"
                        value={values.motivo}
                        onChange={(e) => setField("motivo", e.target.value)}
                    />
                </div>

                {/* Estado */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Estado</label>
                    <select
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                        value={values.estado}
                        onChange={(e) => setField("estado", e.target.value)}
                    >
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="cancelada">Cancelada</option>
                    </select>
                </div>
            </form>
        </Modal>
    );
}
