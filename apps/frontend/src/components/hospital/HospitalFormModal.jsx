import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";

export default function HospitalFormModal({ open, onClose, onSubmit, initialData }) {
    const [form, setForm] = useState({
        nombre: "",
        direccion: "",
        telefono: "",
        activo: true,
    });
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (initialData) {
            setForm({
                nombre: initialData.nombre || "",
                direccion: initialData.direccion || "",
                telefono: initialData.telefono || "",
                activo: !!initialData.activo,
            });
        } else {
            setForm({ nombre: "", direccion: "", telefono: "", activo: true });
        }
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
                            {initialData ? "Editar hospital" : "Nuevo hospital"}
                        </h3>
                        <button
                            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                            onClick={onClose}
                            aria-label="Cerrar"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <form className="grid gap-3 p-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Nombre *</label>
                            <input
                                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                                value={form.nombre}
                                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                                onBlur={() => setTouched(true)}
                                placeholder="Ej: Hospital Central"
                            />
                            {nombreError && <p className="mt-1 text-xs text-rose-600">{nombreError}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">Dirección</label>
                            <textarea
                                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                                rows={2}
                                value={form.direccion}
                                onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
                                placeholder="Calle - Av. - Referencia"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">Teléfono</label>
                            <input
                                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                                value={form.telefono}
                                onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                                placeholder="099 999 9999 / 02-222-333"
                            />
                        </div>

                        <label className="mt-1 inline-flex items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={form.activo}
                                onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
                            />
                            Activo
                        </label>

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
