import { useEffect, useMemo, useState, useRef } from "react";
import Modal from "../../components/ui/Modal";
import { Check, AlertCircle } from "lucide-react";

const empty = {
    hospitalId: "",
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    activo: true,
    especialidades: [],
};

export default function MedicoForm({
    open,
    onClose,
    onSubmit,
    initialData,
    hospitals = [],
    especialidades = [],
    onLoadEspecialidades,
    serverError = "",
}) {
    const [values, setValues] = useState(empty);
    const [touched, setTouched] = useState({});
    const previousHospitalId = useRef(null);

    const isEdit = !!initialData?.id;

    useEffect(() => {
        setValues(
            initialData
                ? {
                    hospitalId: initialData.hospitalId ?? "",
                    nombres: initialData.nombres ?? "",
                    apellidos: initialData.apellidos ?? "",
                    email: initialData.email ?? "",
                    password: "", // No mostrar password en edición por seguridad
                    activo: !!initialData.activo,
                    especialidades: initialData.especialidades?.map(esp => esp.id) || [],
                }
                : empty
        );
        setTouched({});
        // Resetear la referencia del hospital anterior
        previousHospitalId.current = initialData?.hospitalId ?? null;
    }, [initialData, open]);

    // Cargar especialidades cuando cambie el hospital
    useEffect(() => {
        if (values.hospitalId && onLoadEspecialidades) {
            // Solo limpiar especialidades si realmente cambió el hospital
            if (previousHospitalId.current !== null && previousHospitalId.current !== values.hospitalId) {
                setValues(prev => ({ ...prev, especialidades: [] }));
            }
            previousHospitalId.current = values.hospitalId;
            onLoadEspecialidades(values.hospitalId);
        }
    }, [values.hospitalId]); // Solo cuando cambie el hospital

    const errors = useMemo(() => {
        const e = {};
        if (!values.hospitalId) e.hospitalId = "Selecciona un hospital.";
        if (!values.nombres.trim()) e.nombres = "Los nombres son obligatorios.";
        if (!values.apellidos.trim()) e.apellidos = "Los apellidos son obligatorios.";
        if (!values.email.trim()) e.email = "El email es obligatorio.";
        else {
            const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim());
            if (!ok) e.email = "Formato de email inválido.";
        }
        // Validar password: obligatorio en creación, opcional en edición
        if (!isEdit && !values.password.trim()) {
            e.password = "La contraseña es obligatoria.";
        } else if (values.password.trim() && values.password.length < 6) {
            e.password = "La contraseña debe tener al menos 6 caracteres.";
        }
        // Validar especialidades: deben estar disponibles en el hospital seleccionado
        if (values.hospitalId && values.especialidades.length > 0) {
            const especialidadesDisponibles = especialidades.map(esp => esp.id);
            const especialidadesInvalidas = values.especialidades.filter(espId => 
                !especialidadesDisponibles.includes(espId)
            );
            if (especialidadesInvalidas.length > 0) {
                e.especialidades = "Algunas especialidades no están disponibles en el hospital seleccionado.";
            }
        }
        return e;
    }, [values, isEdit, especialidades]);

    const isInvalid = Object.keys(errors).length > 0;

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
        setTouched({
            hospitalId: true,
            nombres: true,
            apellidos: true,
            email: true,
            password: true,
            especialidades: true,
        });
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
            title={isEdit ? "Editar médico" : "Nuevo médico"}
            widthClass="max-w-2xl" // un poco más ancho que hospitales
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
                        form="medico-form"
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
            <form id="medico-form" onSubmit={handleSubmit} className="grid gap-4">
                {serverError ? (
                    <div className="flex items-start gap-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Error al guardar</p>
                            <p className="mt-1">{serverError}</p>
                        </div>
                    </div>
                ) : null}

                {/* Hospital */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Hospital <span className="text-rose-600">*</span>
                    </label>
                    <select
                        value={values.hospitalId}
                        onChange={(e) => setField("hospitalId", Number(e.target.value))}
                        onBlur={() => setTouched((t) => ({ ...t, hospitalId: true }))}
                        className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-4 ${touched.hospitalId && errors.hospitalId
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                            }`}
                    >
                        <option value="">— Selecciona —</option>
                        {hospitals.map((h) => (
                            <option key={h.id} value={h.id}>
                                {h.nombre}
                            </option>
                        ))}
                    </select>
                    {touched.hospitalId && errors.hospitalId ? (
                        <p className="mt-1 text-xs text-rose-600">{errors.hospitalId}</p>
                    ) : null}
                </div>

                {/* Nombres / Apellidos */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Nombres <span className="text-rose-600">*</span>
                        </label>
                        <input
                            value={values.nombres}
                            onChange={(e) => setField("nombres", e.target.value)}
                            onBlur={() => setTouched((t) => ({ ...t, nombres: true }))}
                            placeholder="Ej: María Laura"
                            className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${touched.nombres && errors.nombres
                                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                    : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                                }`}
                        />
                        {touched.nombres && errors.nombres ? (
                            <p className="mt-1 text-xs text-rose-600">{errors.nombres}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Apellidos <span className="text-rose-600">*</span>
                        </label>
                        <input
                            value={values.apellidos}
                            onChange={(e) => setField("apellidos", e.target.value)}
                            onBlur={() => setTouched((t) => ({ ...t, apellidos: true }))}
                            placeholder="Ej: Gómez Pérez"
                            className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${touched.apellidos && errors.apellidos
                                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                    : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                                }`}
                        />
                        {touched.apellidos && errors.apellidos ? (
                            <p className="mt-1 text-xs text-rose-600">{errors.apellidos}</p>
                        ) : null}
                    </div>
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
                        placeholder="medico@clinix.ec"
                        className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${touched.email && errors.email
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                            }`}
                    />
                    {touched.email && errors.email ? (
                        <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
                    ) : null}
                </div>

                {/* Password */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Contraseña {!isEdit && <span className="text-rose-600">*</span>}
                    </label>
                    <input
                        type="password"
                        value={values.password}
                        onChange={(e) => setField("password", e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                        placeholder={isEdit ? "Dejar vacío para mantener la actual" : "Mínimo 6 caracteres"}
                        className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${touched.password && errors.password
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                            }`}
                    />
                    {touched.password && errors.password ? (
                        <p className="mt-1 text-xs text-rose-600">{errors.password}</p>
                    ) : null}
                    {isEdit && (
                        <p className="mt-1 text-xs text-slate-500">
                            Deja vacío para mantener la contraseña actual
                        </p>
                    )}
                </div>

                {/* Especialidades */}
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
                    {touched.especialidades && errors.especialidades ? (
                        <p className="mt-1 text-xs text-rose-600">{errors.especialidades}</p>
                    ) : null}
                </div>

            </form>
        </Modal>
    );
}
