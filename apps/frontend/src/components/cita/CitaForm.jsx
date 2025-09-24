import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import { Check, AlertCircle, User, Calendar, Clock } from "lucide-react";

const empty = {
    hospitalId: "",
  medicoId: "",
  motivo: "",
  fechaInicio: "",
  fechaFin: "",
  estado: "PROGRAMADA", // Siempre PROGRAMADA al crear
  pacienteId: null,
  // Datos del paciente (crear nuevo)
    paciente: {
        nombres: "",
        apellidos: "",
        documento: "",
        telefono: "",
        email: "",
        fechaNacimiento: "",
    sexo: ""
  }
};

export default function CitaForm({
    open,
    onClose,
    onSubmit,
    initialData,
  hospitals = [],
    medicos = [],
    serverError = "",
}) {
    const [values, setValues] = useState(empty);
    const [touched, setTouched] = useState({});
  const [pacienteTouched, setPacienteTouched] = useState({});

    const isEdit = !!initialData?.id;

    useEffect(() => {
        if (initialData) {
            setValues({
        hospitalId: initialData.hospitalId ?? "",
        medicoId: initialData.medicoId ?? "",
        motivo: initialData.motivo ?? "",
        fechaInicio: initialData.fechaInicio ? new Date(initialData.fechaInicio).toISOString().slice(0, 16) : "",
        fechaFin: initialData.fechaFin ? new Date(initialData.fechaFin).toISOString().slice(0, 16) : "",
        estado: initialData.estado ?? "PROGRAMADA",
        pacienteId: initialData.pacienteId ?? null,
                paciente: {
          nombres: initialData.pacienteInfo?.nombres ?? "",
          apellidos: initialData.pacienteInfo?.apellidos ?? "",
          documento: initialData.pacienteInfo?.documento ?? "",
          telefono: initialData.pacienteInfo?.telefono ?? "",
          email: initialData.pacienteInfo?.email ?? "",
          fechaNacimiento: initialData.pacienteInfo?.fechaNacimiento ? new Date(initialData.pacienteInfo.fechaNacimiento).toISOString().slice(0, 10) : "",
          sexo: initialData.pacienteInfo?.sexo ?? ""
        }
            });
        } else {
            setValues(empty);
        }
        setTouched({});
    setPacienteTouched({});
    }, [initialData, open]);

    const errors = useMemo(() => {
        const e = {};
    
    // Validaciones principales
        if (!values.hospitalId) e.hospitalId = "Selecciona un hospital.";
        if (!values.medicoId) e.medicoId = "Selecciona un médico.";
    if (!values.motivo?.trim()) e.motivo = "El motivo es obligatorio.";
    if (!values.fechaInicio) e.fechaInicio = "La fecha de inicio es obligatoria.";
    
    // Validar que las fechas no sean pasadas (con margen de 1 minuto)
    const ahora = new Date();
    const margen = new Date(ahora.getTime() - 60000); // 1 minuto atrás para evitar problemas de precisión
    
    if (values.fechaInicio) {
      const inicio = new Date(values.fechaInicio);
      if (inicio < margen) {
        e.fechaInicio = "La fecha de inicio no puede ser en el pasado.";
      }
    }
    if (values.fechaFin) {
      const fin = new Date(values.fechaFin);
      if (fin < margen) {
        e.fechaFin = "La fecha de fin no puede ser en el pasado.";
      }
    }
    
    // Validar que fechaFin sea posterior a fechaInicio
    if (values.fechaInicio && values.fechaFin) {
      const inicio = new Date(values.fechaInicio);
      const fin = new Date(values.fechaFin);
      if (fin <= inicio) {
        e.fechaFin = "La fecha de fin debe ser posterior a la fecha de inicio.";
      }
    }
    
    // Validaciones del paciente (solo si no hay pacienteId)
    if (!values.pacienteId) {
      if (!values.paciente.nombres?.trim()) e.pacienteNombres = "Los nombres del paciente son obligatorios.";
      if (!values.paciente.apellidos?.trim()) e.pacienteApellidos = "Los apellidos del paciente son obligatorios.";
      if (!values.paciente.documento?.trim()) e.pacienteDocumento = "La cédula de identidad es obligatoria.";
      if (!values.paciente.telefono?.trim()) e.pacienteTelefono = "El teléfono es obligatorio.";
      if (!values.paciente.email?.trim()) e.pacienteEmail = "El email es obligatorio.";
      else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(values.paciente.email.trim())) {
          e.pacienteEmail = "Formato de email inválido.";
        }
      }
      if (!values.paciente.fechaNacimiento) e.pacienteFechaNacimiento = "La fecha de nacimiento es obligatoria.";
      else {
        const fechaNacimiento = new Date(values.paciente.fechaNacimiento);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
        if (fechaNacimiento > hoy) {
          e.pacienteFechaNacimiento = "La fecha de nacimiento no puede ser futura.";
        }
      }
      if (!values.paciente.sexo) e.pacienteSexo = "El sexo es obligatorio.";
    }
    
        return e;
    }, [values]);

  const isInvalid = Object.keys(errors).length > 0;

  function setField(k, v) {
    setValues((s) => {
      const newValues = { ...s, [k]: v };
      
      // Si se cambia la fecha de inicio o fin, automáticamente cambiar estado a PROGRAMADA
      if ((k === 'fechaInicio' || k === 'fechaFin') && v && isEdit) {
        newValues.estado = 'PROGRAMADA';
      }
      
      return newValues;
    });
  }

  // Verificar si se han editado las fechas Y la cita estaba CANCELADA
  const fechasEditadas = isEdit && (
    values.fechaInicio !== initialData?.fechaInicio || 
    values.fechaFin !== initialData?.fechaFin
  ) && initialData?.estado === 'CANCELADA';

  function setPacienteField(k, v) {
    setValues((s) => ({ 
      ...s, 
      paciente: { ...s.paciente, [k]: v } 
    }));
  }

  function markAllTouched() {
        setTouched({
            hospitalId: true,
            medicoId: true,
      motivo: true,
            fechaInicio: true,
            fechaFin: true,
      pacienteNombres: true,
      pacienteApellidos: true,
      pacienteDocumento: true,
      pacienteTelefono: true,
      pacienteEmail: true,
      pacienteFechaNacimiento: true,
      pacienteSexo: true
    });
  }

  function handleSubmit(e) {
        e.preventDefault();
        markAllTouched();
        if (isInvalid) return;

    // Preparar datos para envío
    const submitData = {
            hospitalId: Number(values.hospitalId),
            medicoId: Number(values.medicoId),
      motivo: values.motivo.trim(),
      fechaInicio: new Date(values.fechaInicio).toISOString(),
      fechaFin: new Date(values.fechaFin).toISOString(),
      estado: isEdit ? values.estado : "PROGRAMADA", // Siempre PROGRAMADA al crear
    };

    // Si hay pacienteId (editando), enviar solo el ID
    if (values.pacienteId) {
      submitData.pacienteId = values.pacienteId;
    } else {
      // Si no hay pacienteId (creando), enviar datos del paciente
      submitData.paciente = {
        nombres: values.paciente.nombres.trim(),
        apellidos: values.paciente.apellidos.trim(),
        documento: values.paciente.documento.trim() || null,
        telefono: values.paciente.telefono.trim() || null,
        email: values.paciente.email.trim() || null,
        fechaNacimiento: values.paciente.fechaNacimiento ? new Date(values.paciente.fechaNacimiento).toISOString() : null,
        sexo: values.paciente.sexo || null
      };
    }
    
    console.log('🔍 [DEBUG] CitaForm - Submit data:', submitData);
    onSubmit?.(submitData);
  }

  // Filtrar médicos por hospital seleccionado
  const medicosFiltrados = values.hospitalId 
    ? medicos.filter(m => m.hospitalId === Number(values.hospitalId))
    : medicos;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? "Editar cita" : "Nueva cita"}
      widthClass="max-w-4xl"
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
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white ${
              isInvalid
                                ? "cursor-not-allowed bg-emerald-300"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                    >
                        <Check size={16} /> Guardar
                    </button>
                </>
            }
        >
      <form id="cita-form" onSubmit={handleSubmit} className="space-y-6">
                {serverError ? (
          <div className="flex items-start gap-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error al guardar</p>
              <p className="mt-1">{serverError}</p>
                    </div>
                    </div>
                ) : null}

        {/* Hospital y Médico */}
        <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Hospital <span className="text-rose-600">*</span>
                    </label>
                    <select
              value={values.hospitalId}
              onChange={(e) => {
                setField("hospitalId", e.target.value);
                setField("medicoId", ""); // Reset médico al cambiar hospital
              }}
              onBlur={() => setTouched((t) => ({ ...t, hospitalId: true }))}
              className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-4 ${
                touched.hospitalId && errors.hospitalId
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                            }`}
                    >
              <option value="">— Selecciona hospital —</option>
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

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Médico <span className="text-rose-600">*</span>
            </label>
            <select
              value={values.medicoId}
              onChange={(e) => setField("medicoId", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, medicoId: true }))}
              disabled={!values.hospitalId}
              className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-4 ${
                !values.hospitalId
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : touched.medicoId && errors.medicoId
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
              }`}
            >
              <option value="">— Selecciona médico —</option>
              {medicosFiltrados.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombres} {m.apellidos}
                </option>
              ))}
            </select>
            {touched.medicoId && errors.medicoId ? (
              <p className="mt-1 text-xs text-rose-600">{errors.medicoId}</p>
            ) : null}
            {!values.hospitalId && (
              <p className="mt-1 text-xs text-slate-500">Primero selecciona un hospital</p>
            )}
          </div>
        </div>

        {/* Motivo */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Motivo <span className="text-rose-600">*</span>
          </label>
          <textarea
            rows={3}
            value={values.motivo}
            onChange={(e) => setField("motivo", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, motivo: true }))}
            placeholder="Describe el motivo de la cita..."
            className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
              touched.motivo && errors.motivo
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
            }`}
          />
          {touched.motivo && errors.motivo ? (
            <p className="mt-1 text-xs text-rose-600">{errors.motivo}</p>
          ) : null}
        </div>

        {/* Fechas */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Fecha de inicio <span className="text-rose-600">*</span>
            </label>
            <input
              type="datetime-local"
              value={values.fechaInicio}
              onChange={(e) => setField("fechaInicio", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, fechaInicio: true }))}
              min={(() => {
                const now = new Date();
                const offset = now.getTimezoneOffset();
                const localTime = new Date(now.getTime() - (offset * 60000));
                return localTime.toISOString().slice(0, 16);
              })()}
              className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-4 ${
                touched.fechaInicio && errors.fechaInicio
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
              }`}
            />
            {touched.fechaInicio && errors.fechaInicio ? (
              <p className="mt-1 text-xs text-rose-600">{errors.fechaInicio}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Fecha de fin <span className="text-rose-600">*</span>
            </label>
            <input
              type="datetime-local"
              value={values.fechaFin}
              onChange={(e) => setField("fechaFin", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, fechaFin: true }))}
              min={(() => {
                const now = new Date();
                const offset = now.getTimezoneOffset();
                const localTime = new Date(now.getTime() - (offset * 60000));
                return localTime.toISOString().slice(0, 16);
              })()}
              className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-4 ${
                touched.fechaFin && errors.fechaFin
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
              }`}
            />
            {touched.fechaFin && errors.fechaFin ? (
              <p className="mt-1 text-xs text-rose-600">{errors.fechaFin}</p>
            ) : null}
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Estado
          </label>
          <select
            value={values.estado}
            onChange={(e) => setField("estado", e.target.value)}
            disabled={!isEdit || fechasEditadas} // Solo editable en modo edición y si no se editaron fechas
            className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-4 ${
              !isEdit || fechasEditadas
                ? "cursor-not-allowed bg-slate-100 text-slate-500 border-slate-300"
                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
            }`}
          >
            <option value="PROGRAMADA">Programada</option>
            <option value="ATENDIDA">Atendida</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
          {!isEdit && (
            <p className="mt-1 text-xs text-slate-500">
              Las nuevas citas siempre se crean como "Programada"
            </p>
          )}
        </div>

        {/* Separador */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-700">
            <User size={20} />
            Datos del Paciente
          </h3>
          {values.pacienteId ? (
            <p className="mb-4 text-sm text-slate-600">
              Los datos del paciente no se pueden modificar. Esta cita está asociada a un paciente existente.
            </p>
          ) : (
            <p className="mb-4 text-sm text-slate-600">
              Si el paciente ya existe, puedes dejar estos campos vacíos.
            </p>
          )}
        </div>

        {/* Datos del Paciente */}
        <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Nombres <span className="text-rose-600">*</span>
                        </label>
                        <input
              value={values.paciente.nombres}
              onChange={(e) => setPacienteField("nombres", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, pacienteNombres: true }))}
              placeholder="Ej: María Laura"
              disabled={!!values.pacienteId}
              className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                values.pacienteId 
                  ? "cursor-not-allowed bg-slate-100 text-slate-500 border-slate-300"
                  : touched.pacienteNombres && errors.pacienteNombres
                                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                    : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                                }`}
                        />
            {touched.pacienteNombres && errors.pacienteNombres ? (
              <p className="mt-1 text-xs text-rose-600">{errors.pacienteNombres}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Apellidos <span className="text-rose-600">*</span>
                        </label>
                        <input
              value={values.paciente.apellidos}
              onChange={(e) => setPacienteField("apellidos", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, pacienteApellidos: true }))}
              placeholder="Ej: Gómez Pérez"
              disabled={!!values.pacienteId}
              className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                values.pacienteId 
                  ? "cursor-not-allowed bg-slate-100 text-slate-500 border-slate-300"
                  : touched.pacienteApellidos && errors.pacienteApellidos
                                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                                    : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                                }`}
                        />
            {touched.pacienteApellidos && errors.pacienteApellidos ? (
              <p className="mt-1 text-xs text-rose-600">{errors.pacienteApellidos}</p>
                        ) : null}
                </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Cédula de identidad <span className="text-rose-600">*</span>
                        </label>
                        <input
                            value={values.paciente.documento}
              onChange={(e) => setPacienteField("documento", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, pacienteDocumento: true }))}
              placeholder="Ej: 1234567890"
              disabled={!!values.pacienteId}
              className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                values.pacienteId 
                  ? "cursor-not-allowed bg-slate-100 text-slate-500 border-slate-300"
                  : touched.pacienteDocumento && errors.pacienteDocumento
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
              }`}
                        />
                        {touched.pacienteDocumento && errors.pacienteDocumento ? (
                          <p className="mt-1 text-xs text-rose-600">{errors.pacienteDocumento}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Teléfono <span className="text-rose-600">*</span>
                        </label>
                        <input
                            value={values.paciente.telefono}
              onChange={(e) => setPacienteField("telefono", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, pacienteTelefono: true }))}
              placeholder="Ej: 099 999 9999"
              disabled={!!values.pacienteId}
              className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                values.pacienteId 
                  ? "cursor-not-allowed bg-slate-100 text-slate-500 border-slate-300"
                  : touched.pacienteTelefono && errors.pacienteTelefono
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
              }`}
            />
            {touched.pacienteTelefono && errors.pacienteTelefono ? (
              <p className="mt-1 text-xs text-rose-600">{errors.pacienteTelefono}</p>
            ) : null}
                </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Email <span className="text-rose-600">*</span>
                        </label>
                        <input
                            type="email"
                            value={values.paciente.email}
              onChange={(e) => setPacienteField("email", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, pacienteEmail: true }))}
              placeholder="Ej: paciente@email.com"
              disabled={!!values.pacienteId}
              className={`w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                values.pacienteId 
                  ? "cursor-not-allowed bg-slate-100 text-slate-500 border-slate-300"
                  : touched.pacienteEmail && errors.pacienteEmail
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
              }`}
            />
            {touched.pacienteEmail && errors.pacienteEmail ? (
              <p className="mt-1 text-xs text-rose-600">{errors.pacienteEmail}</p>
            ) : null}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Fecha de nacimiento <span className="text-rose-600">*</span>
                        </label>
                        <input
                            type="date"
                            value={values.paciente.fechaNacimiento}
              onChange={(e) => setPacienteField("fechaNacimiento", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, pacienteFechaNacimiento: true }))}
              max={new Date().toISOString().split('T')[0]} // Máximo fecha actual
              disabled={!!values.pacienteId}
              className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-4 ${
                values.pacienteId 
                  ? "cursor-not-allowed bg-slate-100 text-slate-500 border-slate-300"
                  : touched.pacienteFechaNacimiento && errors.pacienteFechaNacimiento
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
              }`}
            />
            {touched.pacienteFechaNacimiento && errors.pacienteFechaNacimiento ? (
              <p className="mt-1 text-xs text-rose-600">{errors.pacienteFechaNacimiento}</p>
            ) : null}
                </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Sexo <span className="text-rose-600">*</span>
                        </label>
                        <select
                            value={values.paciente.sexo}
              onChange={(e) => setPacienteField("sexo", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, pacienteSexo: true }))}
              disabled={!!values.pacienteId}
              className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-4 ${
                values.pacienteId 
                  ? "cursor-not-allowed bg-slate-100 text-slate-500 border-slate-300"
                  : touched.pacienteSexo && errors.pacienteSexo
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
              }`}
            >
              <option value="">— Selecciona —</option>
                            <option value="MASCULINO">Masculino</option>
                            <option value="FEMENINO">Femenino</option>
                            <option value="OTRO">Otro</option>
                        </select>
                        {touched.pacienteSexo && errors.pacienteSexo ? (
                          <p className="mt-1 text-xs text-rose-600">{errors.pacienteSexo}</p>
                        ) : null}
                    </div>
                </div>
            </form>
        </Modal>
    );
}