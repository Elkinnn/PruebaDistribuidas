import { useEffect, useMemo, useState } from "react";
import Modal from "../../components/ui/Modal";
import { Check } from "lucide-react";

function toLocalInput(dt) {
    if (!dt) return "";
    const d = new Date(dt);
    if (isNaN(d.getTime())) return "";
    // Ajuste a local: quitamos el offset para mostrar HH:MM locales
    const tzOffset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - tzOffset * 60 * 1000);
    return local.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
}

function toIsoFromLocalInput(localStr) {
    if (!localStr) return "";
    // El string del input NO tiene zona; créalo como local
    const [datePart, timePart] = localStr.split("T");
    if (!datePart || !timePart) return "";
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm] = timePart.split(":").map(Number);
    const asLocal = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
    if (isNaN(asLocal.getTime())) return "";
    return asLocal.toISOString();
}


const empty = {
    hospitalId: "",
    paciente: {
        nombres: "",
        apellidos: "",
        documento: "",
        telefono: "",
        email: "",
        fechaNacimiento: "",
        sexo: "MASCULINO",
    },
    medicoId: "",
    fechaInicio: "",
    fechaFin: "",
    motivo: "",
    estado: "pendiente",
};

export default function CitaForm({
    open,
    onClose,
    onSubmit,
    initialData,
    medicos = [],
    hospitals = [],
    serverError = "",
}) {
    const [values, setValues] = useState(empty);
    const [touched, setTouched] = useState({});
    const isEdit = !!initialData?.id;

    useEffect(() => {
        if (initialData) {
            const p = initialData.pacienteInfo || initialData.paciente || {};
            const pObj = typeof p === "string" ? {} : p;

            setValues({
                id: initialData.id,
                hospitalId: String(initialData.hospitalId ?? ""),
                paciente: {
                    nombres: pObj.nombres || "",
                    apellidos: pObj.apellidos || "",
                    documento: pObj.documento || "",
                    telefono: pObj.telefono || "",
                    email: pObj.email || "",
                    fechaNacimiento: pObj.fechaNacimiento
                        ? String(pObj.fechaNacimiento).slice(0, 10)
                        : "",
                    sexo: pObj.sexo || "MASCULINO",
                },
                medicoId: String(initialData.medicoId ?? "") || "",
                fechaInicio: toLocalInput(initialData.fechaInicio),
                fechaFin: toLocalInput(initialData.fechaFin),
                motivo: initialData.motivo || "",
                estado: initialData.estado || "pendiente",
            });
        } else {
            setValues(empty);
        }
        setTouched({});
    }, [initialData, open]);

    const errors = useMemo(() => {
        const e = {};
        if (!values.hospitalId) e.hospitalId = "Selecciona un hospital.";
        if (!values.paciente.nombres.trim()) e.nombres = "Nombres obligatorios.";
        if (!values.paciente.apellidos.trim()) e.apellidos = "Apellidos obligatorios.";
        if (!values.medicoId) e.medicoId = "Selecciona un médico.";


        if (values.fechaInicio && values.fechaFin) {
            const ini = new Date(toIsoFromLocalInput(values.fechaInicio)).getTime();
            const fin = new Date(toIsoFromLocalInput(values.fechaFin)).getTime();
            if (Number.isFinite(ini) && Number.isFinite(fin) && fin <= ini) {
                e.rango = "La hora de fin debe ser posterior al inicio.";
            }
        }
        return e;
    }, [values]);

    const isInvalid =
        !values.hospitalId ||
        !values.paciente.nombres.trim() ||
        !values.paciente.apellidos.trim() ||
        !values.medicoId ||
        !values.fechaInicio ||
        !values.fechaFin ||
        !!errors.rango;

    const setField = (k, v) => setValues((s) => ({ ...s, [k]: v }));
    const setPac = (k, v) =>
        setValues((s) => ({ ...s, paciente: { ...s.paciente, [k]: v } }));

    // cierra el datepicker y marca touched
    const handleDateChange = (key, e) => {
        const v = e.target.value; // esperado: YYYY-MM-DDTHH:MM (local)
        setField(key, v);
        setTouched((t) => ({ ...t, [key]: true }));
        requestAnimationFrame(() => e.target.blur());
    };

    const markAllTouched = () =>
        setTouched({
            hospitalId: true,
            nombres: true,
            apellidos: true,
            medicoId: true,
            fechaInicio: true,
            fechaFin: true,
            motivo: true,
            estado: true,
            documento: true,
            telefono: true,
            email: true,
            fechaNacimiento: true,
            sexo: true,
        });

    const handleSubmit = (e) => {
        e.preventDefault();
        markAllTouched();
        if (isInvalid) return;

        const fullName = `${values.paciente.nombres} ${values.paciente.apellidos}`.trim();

        const payload = {
            ...values,
            hospitalId: Number(values.hospitalId),
            medicoId: Number(values.medicoId),
            fechaInicio: toIsoFromLocalInput(values.fechaInicio),
            fechaFin: toIsoFromLocalInput(values.fechaFin),
            pacienteInfo: { ...values.paciente },
            paciente: fullName,
        };

        onSubmit?.(payload);
    };

    // Banner superior: solo si realmente falta inicio/fin
    const showTopDatesError =
        (touched.fechaInicio || touched.fechaFin) &&
        (!values.fechaInicio || !values.fechaFin);

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
            <form id="cita-form" onSubmit={handleSubmit} className="space-y-5">
                {serverError ? (
                    <div className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700 ring-1 ring-rose-200">
                        {serverError}
                    </div>
                ) : null}

                {showTopDatesError ? (
                    <div className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700 ring-1 ring-rose-200">
                        La fecha y hora son obligatorias.
                    </div>
                ) : null}

                {/* Hospital */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Hospital <span className="text-rose-600">*</span>
                    </label>
                    <select
                        className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-4 ${touched.hospitalId && errors.hospitalId
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                            }`}
                        value={values.hospitalId}
                        onBlur={() => setTouched((t) => ({ ...t, hospitalId: true }))}
                        onChange={(e) => setField("hospitalId", e.target.value)}
                    >
                        <option value="">Selecciona…</option>
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Nombres <span className="text-rose-600">*</span>
                        </label>
                        <input
                            className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${touched.nombres && errors.nombres
                                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                    : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                                }`}
                            placeholder="Ej: Juan Carlos"
                            value={values.paciente.nombres}
                            onBlur={() => setTouched((t) => ({ ...t, nombres: true }))}
                            onChange={(e) => setPac("nombres", e.target.value)}
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
                            className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${touched.apellidos && errors.apellidos
                                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                    : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                                }`}
                            placeholder="Ej: Pérez García"
                            value={values.paciente.apellidos}
                            onBlur={() => setTouched((t) => ({ ...t, apellidos: true }))}
                            onChange={(e) => setPac("apellidos", e.target.value)}
                        />
                        {touched.apellidos && errors.apellidos ? (
                            <p className="mt-1 text-xs text-rose-600">{errors.apellidos}</p>
                        ) : null}
                    </div>
                </div>

                {/* Documento / Teléfono */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Documento
                        </label>
                        <input
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                            placeholder="Cédula/Documento"
                            value={values.paciente.documento}
                            onChange={(e) => setPac("documento", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Teléfono
                        </label>
                        <input
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                            placeholder="099 999 9999"
                            value={values.paciente.telefono}
                            onChange={(e) => setPac("telefono", e.target.value)}
                        />
                    </div>
                </div>

                {/* Email / Fecha Nacimiento */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Email
                        </label>
                        <input
                            type="email"
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                            placeholder="correo@ejemplo.com"
                            value={values.paciente.email}
                            onChange={(e) => setPac("email", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Fecha de nacimiento
                        </label>
                        <input
                            type="date"
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                            value={values.paciente.fechaNacimiento}
                            onChange={(e) => setPac("fechaNacimiento", e.target.value)}
                        />
                    </div>
                </div>

                {/* Sexo */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Sexo
                        </label>
                        <select
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                            value={values.paciente.sexo}
                            onChange={(e) => setPac("sexo", e.target.value)}
                        >
                            <option value="MASCULINO">Masculino</option>
                            <option value="FEMENINO">Femenino</option>
                            <option value="OTRO">Otro</option>
                        </select>
                    </div>
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

                {/* Inicio / Fin */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Inicio <span className="text-rose-600">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-4 ${touched.fechaInicio && !values.fechaInicio
                                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                    : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                                }`}
                            value={values.fechaInicio}
                            onBlur={() => setTouched((t) => ({ ...t, fechaInicio: true }))}
                            onChange={(e) => handleDateChange("fechaInicio", e)}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Fin <span className="text-rose-600">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-4 ${touched.fechaFin && !values.fechaFin
                                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                    : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                                }`}
                            value={values.fechaFin}
                            onBlur={() => setTouched((t) => ({ ...t, fechaFin: true }))}
                            onChange={(e) => handleDateChange("fechaFin", e)}
                        />
                    </div>
                </div>

                {errors.rango ? (
                    <p className="text-xs text-rose-600">{errors.rango}</p>
                ) : null}

                {/* Motivo */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Motivo
                    </label>
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
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Estado
                    </label>
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
