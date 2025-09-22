import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import { Check } from "lucide-react";

const empty = { nombre: "", direccion: "", telefono: "", activo: true, especialidades: [] };

export default function HospitalForm({ open, onClose, onSubmit, initialData, especialidades = [] }) {
    const [values, setValues] = useState(empty);
    const [touched, setTouched] = useState({});
    const isEdit = !!initialData?.id;

    useEffect(() => {
        setValues(initialData ? { 
            ...initialData, 
            especialidades: initialData.especialidades || [] 
        } : empty);
        setTouched({});
    }, [initialData, open]);

    const errors = useMemo(() => {
        const e = {};
        if (!values.nombre?.trim()) e.nombre = "El nombre es obligatorio.";
        if (values.telefono?.trim()) {
            const ok = /^(\+?\d[\d\s-]{7,})$/.test(values.telefono.trim());
            if (!ok) e.telefono = "Teléfono inválido (use dígitos, espacios o guiones).";
        }
        return e;
    }, [values]);

    const isInvalid = Object.keys(errors).length > 0 || !values.nombre?.trim();

    function setField(k, v) {
        setValues((s) => ({ ...s, [k]: v }));
    }

    function toggleEspecialidad(especialidadId) {
        setValues(prev => ({
            ...prev,
            especialidades: prev.especialidades.includes(especialidadId)
                ? prev.especialidades.filter(id => id !== especialidadId)
                : [...prev.especialidades, especialidadId]
        }));
    }

    function markAllTouched() {
        setTouched({ nombre: true, direccion: true, telefono: true, especialidades: true });
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
            title={isEdit ? "Editar hospital" : "Nuevo hospital"}
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
                        form="hospital-form"
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
            <form id="hospital-form" onSubmit={handleSubmit} className="space-y-5">
                {/* nombre */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Nombre <span className="text-rose-600">*</span>
                    </label>
                    <input
                        className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${touched.nombre && errors.nombre
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                            }`}
                        placeholder="Ej: Hospital Central"
                        value={values.nombre}
                        onBlur={() => setTouched((t) => ({ ...t, nombre: true }))}
                        onChange={(e) => setField("nombre", e.target.value)}
                    />
                    {touched.nombre && errors.nombre ? (
                        <p className="mt-1 text-xs text-rose-600">{errors.nombre}</p>
                    ) : null}
                </div>

                {/* direccion */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Dirección
                    </label>
                    <textarea
                        rows={3}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                        placeholder="Calle - Av. - Referencia"
                        value={values.direccion}
                        onChange={(e) => setField("direccion", e.target.value)}
                    />
                </div>

                {/* telefono */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Teléfono
                    </label>
                    <input
                        className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${touched.telefono && errors.telefono
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                            }`}
                        placeholder="099 999 9999 / 02-222-333"
                        value={values.telefono}
                        onBlur={() => setTouched((t) => ({ ...t, telefono: true }))}
                        onChange={(e) => setField("telefono", e.target.value)}
                    />
                    {touched.telefono && errors.telefono ? (
                        <p className="mt-1 text-xs text-rose-600">{errors.telefono}</p>
                    ) : null}
                </div>

                {/* especialidades */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Especialidades
                    </label>
                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-slate-300 p-3">
                        {especialidades.length === 0 ? (
                            <p className="text-sm text-slate-500">No hay especialidades disponibles</p>
                        ) : (
                            especialidades.map((esp) => (
                                <label key={esp.id} className="flex select-none items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-200"
                                        checked={values.especialidades.includes(esp.id)}
                                        onChange={() => toggleEspecialidad(esp.id)}
                                    />
                                    <span className="text-sm text-slate-700">{esp.nombre}</span>
                                </label>
                            ))
                        )}
                    </div>
                    {values.especialidades.length > 0 && (
                        <p className="mt-1 text-xs text-slate-500">
                            {values.especialidades.length} especialidad{values.especialidades.length !== 1 ? 'es' : ''} seleccionada{values.especialidades.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* activo */}
                <label className="flex select-none items-center gap-2">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-200"
                        checked={values.activo}
                        onChange={(e) => setField("activo", e.target.checked)}
                    />
                    <span className="text-sm text-slate-700">Activo</span>
                </label>
            </form>
        </Modal>
    );
}
