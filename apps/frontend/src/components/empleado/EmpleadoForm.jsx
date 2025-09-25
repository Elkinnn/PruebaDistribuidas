import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import Modal from "../ui/Modal";

const empty = {
    hospitalId: "",
    nombres: "",
    apellidos: "",
    tipo: "",
    email: "",
    telefono: "",
    activo: true,
};

const TIPOS = ["LIMPIEZA", "SEGURIDAD", "RECEPCION", "ADMINISTRATIVO", "OTRO"];

export default function EmpleadoForm({
    open,
    onClose,
    onSubmit,
    initialData,
    hospitals = [],
    serverError = "",
}) {
    const [values, setValues] = useState(empty);
    const [touched, setTouched] = useState({});

    const isEdit = !!initialData?.id;

    useEffect(() => {
        setValues(initialData ? { ...empty, ...initialData } : empty);
        setTouched({});
    }, [initialData, open]);

    const errors = useMemo(() => {
        const e = {};
        if (!values.hospitalId) e.hospitalId = "Selecciona un hospital.";
        if (!values.nombres?.trim()) e.nombres = "Nombres es obligatorio.";
        if (!values.apellidos?.trim()) e.apellidos = "Apellidos es obligatorio.";
        if (!values.tipo) e.tipo = "Selecciona un tipo.";
        if (!values.email?.trim()) e.email = "Email es obligatorio.";
        if (!values.telefono?.trim()) e.telefono = "Teléfono es obligatorio.";
        
        // Validaciones de formato solo si hay contenido
        if (values.email?.trim()) {
            const ok = /^\S+@\S+\.\S+$/.test(values.email.trim());
            if (!ok) e.email = "Correo inválido.";
        }
        if (values.telefono?.trim()) {
            const ok = /^(\+?\d[\d\s-]{7,})$/.test(values.telefono.trim());
            if (!ok) e.telefono = "Teléfono inválido.";
        }
        return e;
    }, [values]);

    const isInvalid = Object.keys(errors).length > 0;

    function setField(k, v) {
        setValues((s) => ({ ...s, [k]: v }));
    }

    function markAllTouched() {
        setTouched({
            hospitalId: true,
            nombres: true,
            apellidos: true,
            tipo: true,
            email: true,
            telefono: true,
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        markAllTouched();
        if (isInvalid) return;
        onSubmit?.({
            ...values,
            hospitalId: Number(values.hospitalId),
        });
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? "Editar empleado" : "Nuevo empleado"}
            size="md"
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
                        form="empleado-form"
                        disabled={isInvalid}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white ${isInvalid
                                ? "cursor-not-allowed bg-emerald-300"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                    >
                        <Check size={16} /> Guardar
                    </button>
                </>
            }
        >
            <form id="empleado-form" onSubmit={handleSubmit} className="space-y-4">
                {serverError ? (
                    <div className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700 ring-1 ring-rose-200">
                        {serverError}
                    </div>
                ) : null}

                {/* Hospital */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Hospital <span className="text-rose-600">*</span>
                    </label>
                    <select
                        value={values.hospitalId}
                        onChange={(e) => setField("hospitalId", e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, hospitalId: true }))}
                        className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-4 ${touched.hospitalId && errors.hospitalId
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                            }`}
                    >
                        <option value="">Selecciona…</option>
                        {hospitals.map((h) => (
                            <option key={h.id} value={h.id}>{h.nombre}</option>
                        ))}
                    </select>
                    {touched.hospitalId && errors.hospitalId ? (
                        <p className="mt-1 text-xs text-rose-600">{errors.hospitalId}</p>
                    ) : null}
                </div>

                {/* Nombres */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Nombres <span className="text-rose-600">*</span>
                    </label>
                    <input
                        value={values.nombres}
                        onChange={(e) => setField("nombres", e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, nombres: true }))}
                        placeholder="Juan Carlos"
                        className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${touched.nombres && errors.nombres
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                            }`}
                    />
                    {touched.nombres && errors.nombres ? (
                        <p className="mt-1 text-xs text-rose-600">{errors.nombres}</p>
                    ) : null}
                </div>

                {/* Apellidos */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Apellidos <span className="text-rose-600">*</span>
                    </label>
                    <input
                        value={values.apellidos}
                        onChange={(e) => setField("apellidos", e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, apellidos: true }))}
                        placeholder="Pérez López"
                        className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${touched.apellidos && errors.apellidos
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                            }`}
                    />
                    {touched.apellidos && errors.apellidos ? (
                        <p className="mt-1 text-xs text-rose-600">{errors.apellidos}</p>
                    ) : null}
                </div>

                {/* Tipo */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Tipo <span className="text-rose-600">*</span>
                    </label>
                    <select
                        value={values.tipo}
                        onChange={(e) => setField("tipo", e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, tipo: true }))}
                        className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-4 ${touched.tipo && errors.tipo
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                            }`}
                    >
                        <option value="">Selecciona…</option>
                        {TIPOS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                    {touched.tipo && errors.tipo ? (
                        <p className="mt-1 text-xs text-rose-600">{errors.tipo}</p>
                    ) : null}
                </div>

                {/* Email */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Email <span className="text-rose-600">*</span>
                    </label>
                    <input
                        value={values.email}
                        onChange={(e) => setField("email", e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                        placeholder="empleado@clinix.com"
                        className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${touched.email && errors.email
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                            }`}
                    />
                    {touched.email && errors.email ? (
                        <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
                    ) : null}
                </div>

                {/* Teléfono */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Teléfono <span className="text-rose-600">*</span>
                    </label>
                    <input
                        value={values.telefono}
                        onChange={(e) => setField("telefono", e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, telefono: true }))}
                        placeholder="099 999 9999 / 02-222-333"
                        className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${touched.telefono && errors.telefono
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                            }`}
                    />
                    {touched.telefono && errors.telefono ? (
                        <p className="mt-1 text-xs text-rose-600">{errors.telefono}</p>
                    ) : null}
                </div>

            </form>
        </Modal>
    );
}
