const STORAGE_KEY = "clinix:citas";

// Pequeño delay para simular API
const sleep = (res) => new Promise((r) => setTimeout(() => r(res), 120));

function readAll() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeAll(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function genId() {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function toISO(value) {
    // Acepta datetime-local o ISO; devuelve ISO o cadena vacía
    if (!value) return "";
    const d = new Date(value);
    return isNaN(d.getTime()) ? "" : d.toISOString();
}

function validate(payload) {
    if (!payload.paciente || !payload.paciente.trim()) {
        throw new Error("El nombre del paciente es obligatorio.");
    }
    if (payload.medicoId === undefined || payload.medicoId === null || payload.medicoId === "") {
        throw new Error("El médico es obligatorio.");
    }
    if (!payload.fechaHora) {
        throw new Error("La fecha y hora son obligatorias.");
    }
}

/**
 * Lista con filtro y paginación.
 * q busca en: paciente, motivo, estado (case-insensitive).
 */
export async function listCitas({ page = 1, pageSize = 8, q = "" } = {}) {
    const all = readAll();

    const qq = (q || "").trim().toLowerCase();
    let filtered = qq
        ? all.filter((c) => {
            const paciente = (c.paciente || "").toLowerCase();
            const motivo = (c.motivo || "").toLowerCase();
            const estado = (c.estado || "").toLowerCase();
            return (
                paciente.includes(qq) ||
                motivo.includes(qq) ||
                estado.includes(qq)
            );
        })
        : all;

    // Orden por fecha (desc)
    filtered = filtered.sort((a, b) => {
        const fa = a.fechaHora || "";
        const fb = b.fechaHora || "";
        return fb.localeCompare(fa);
    });

    const total = filtered.length;
    const start = Math.max(0, (page - 1) * pageSize);
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return sleep({ items, total });
}

/**
 * Crea una cita.
 * values esperado: { paciente, medicoId, fechaHora, motivo?, estado? }
 * estado: "pendiente" | "confirmada" | "cancelada"
 */
export async function createCita(values) {
    const all = readAll();

    const payload = {
        id: genId(),
        paciente: (values.paciente || "").trim(),
        medicoId: Number(values.medicoId),
        fechaHora: toISO(values.fechaHora),
        motivo: values.motivo || "",
        estado: values.estado || "pendiente",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    validate(payload);

    all.push(payload);
    writeAll(all);
    return sleep(payload);
}

/**
 * Actualiza una cita por id.
 */
export async function updateCita(id, values) {
    const all = readAll();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Cita no encontrada.");

    const merged = {
        ...all[idx],
        paciente: values.paciente !== undefined ? String(values.paciente).trim() : all[idx].paciente,
        medicoId:
            values.medicoId !== undefined ? Number(values.medicoId) : all[idx].medicoId,
        fechaHora:
            values.fechaHora !== undefined ? toISO(values.fechaHora) : all[idx].fechaHora,
        motivo: values.motivo !== undefined ? values.motivo : all[idx].motivo,
        estado: values.estado !== undefined ? values.estado : all[idx].estado,
        updatedAt: new Date().toISOString(),
    };

    validate(merged);

    all[idx] = merged;
    writeAll(all);
    return sleep(merged);
}

/**
 * Elimina una cita por id.
 */
export async function deleteCita(id) {
    const all = readAll();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Cita no encontrada.");

    all.splice(idx, 1);
    writeAll(all);
    return sleep({ ok: true });
}
