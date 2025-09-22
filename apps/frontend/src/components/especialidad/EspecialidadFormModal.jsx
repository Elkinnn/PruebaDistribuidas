import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import { Check } from "lucide-react";

const EMPTY = { nombre: "", descripcion: "" };

export default function EspecialidadFormModal({
    open,
    onClose,
    onSubmit,
    initialData,
    serverError = "",
}) {
    const [values, setValues] = useState(EMPTY);
    const [touched, setTouched] = useState({});

    const isEdit = !!initialData?.id;

    useEffect(() => {
        setValues(initialData ? { ...EMPTY, ...initialData } : EMPTY);
        setTouched({});
    }, [initialData, open]);

    const errors = useMemo(() => {
        const e = {};
        if (!values.nombre?.trim()) e.nombre = "El nombre es obligatorio.";
        return e;
    }, [values]);

    const isInvalid = Object.keys(errors).length > 0;

    function setField(k, v) {
        setValues((s) => ({ ...s, [k]: v }));
    }

    function markAllTouched() {
        setTouched({ nombre: true, descripcion: true });
    }

    function handleSubmit(e) {
        e.preventDefault();
        markAllTouched();
        if (isInvalid) return;
        onSubmit?.(values);
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? "Editar especialidad" : "Nueva especialidad"}
            maxWidth="max-w-2xl"
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
                        form="especialidad-form"
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
            <form id="especialidad-form" onSubmit={handleSubmit} className="space-y-5">
                {serverError ? (
                    <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
                        {serverError}
                    </div>
                ) : null}

                {/* Nombre */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Nombre <span className="text-rose-600">*</span>
                    </label>
                    <input
                        className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${touched.nombre && errors.nombre
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                            }`}
                        placeholder="Ej: Cardiología"
                        value={values.nombre}
                        onBlur={() => setTouched((t) => ({ ...t, nombre: true }))}
                        onChange={(e) => setField("nombre", e.target.value)}
                    />
                    {touched.nombre && errors.nombre ? (
                        <p className="mt-1 text-xs text-rose-600">{errors.nombre}</p>
                    ) : null}
                </div>

                {/* Descripción */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Descripción
                    </label>
                    <textarea
                        rows={3}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                        placeholder="Detalle opcional"
                        value={values.descripcion}
                        onChange={(e) => setField("descripcion", e.target.value)}
                    />
                </div>
            </form>
        </Modal>
    );
}
