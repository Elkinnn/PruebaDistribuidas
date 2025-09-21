import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";

export default function EspecialidadFormModal({ open, onClose, onSubmit, initialData, serverError }) {
    const [form, setForm] = useState({ nombre: "", descripcion: "" });
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        setForm(
            initialData
                ? { nombre: initialData.nombre || "", descripcion: initialData.descripcion || "" }
                : { nombre: "", descripcion: "" }
        );
        setTouched(false);
    }, [initialData, open]);

    const nombreError = touched && !form.nombre.trim() ? "El nombre es obligatorio" : "";

    function handleSubmit(e) {
        e.preventDefault();
        setTouched(true);
        if (nombreError) return;
        onSubmit(form);
    }

    if (!open) return null;

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
            <div className="fixed inset-0 z-50 grid place-items-center p-4">
                <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                        <h3 className="text-sm font-semibold">
                            {initialData ? "Editar especialidad" : "Nueva especialidad"}
                        </h3>
                        <button className="rounded-md p-1 text-slate-500 hover:bg-slate-100" onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>

                    <form className="grid gap-3 p-5" onSubmit={handleSubmit}>
                        {serverError ? (
                            <div className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700 ring-1 ring-rose-200">
                                {serverError}
                            </div>
                        ) : null}

                        <div>
                            <label className="text-sm font-medium text-slate-700">Nombre *</label>
                            <input
                                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                                value={form.nombre}
                                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                                onBlur={() => setTouched(true)}
                                placeholder="Ej: Cardiología"
                            />
                            {nombreError && <p className="mt-1 text-xs text-rose-600">{nombreError}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">Descripción</label>
                            <textarea
                                rows={3}
                                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                                value={form.descripcion}
                                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                                placeholder="Detalle opcional"
                            />
                        </div>

                        <div className="mt-2 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                            >
                                <Check size={16} />
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
