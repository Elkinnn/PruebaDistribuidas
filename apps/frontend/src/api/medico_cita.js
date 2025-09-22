// src/api/cita.js
const STORAGE_KEY = "clinix:citas";
const ESTADOS = ["PROGRAMADA", "CANCELADA", "ATENDIDA"];
const sleep = (res) => new Promise((r) => setTimeout(() => r(res), 100));

function readAll() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function writeAll(items) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
function genId() { return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
function toISO(v){ if(!v) return ""; const d=new Date(v); return isNaN(d)? "": d.toISOString(); }

function validate(payload) {
  if (!payload.paciente?.nombres?.trim()) throw new Error("Los nombres del paciente son obligatorios.");
  if (!payload.paciente?.apellidos?.trim()) throw new Error("Los apellidos del paciente son obligatorios.");
  if (payload.medicoId === undefined || payload.medicoId === null || payload.medicoId === "")
    throw new Error("El médico es obligatorio.");
  if (!payload.inicio || !payload.fin) throw new Error("Inicio y fin son obligatorios.");
  if (new Date(payload.fin) <= new Date(payload.inicio))
    throw new Error("La fecha de fin debe ser mayor que la de inicio.");
  if (!ESTADOS.includes(payload.estado)) throw new Error("Estado inválido.");
}

export async function listCitas({ page = 1, pageSize = 8, q = "" } = {}) {
  const all = readAll();
  const qq = (q || "").toLowerCase().trim();

  let filtered = qq
    ? all.filter((c) => {
        const paciente = `${c.paciente?.nombres || ""} ${c.paciente?.apellidos || ""}`.toLowerCase();
        return paciente.includes(qq) || (c.motivo || "").toLowerCase().includes(qq) || (c.estado || "").toLowerCase().includes(qq);
      })
    : all;

  filtered = filtered.sort((a, b) => String(b.inicio).localeCompare(String(a.inicio)));
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  return sleep({ items: filtered.slice(start, start + pageSize), total });
}

export async function createCita(values) {
  const all = readAll();
  const payload = {
    id: genId(),
    paciente: {
      nombres: (values.paciente?.nombres || "").trim(),
      apellidos: (values.paciente?.apellidos || "").trim(),
      documento: values.paciente?.documento || "",
      telefono: values.paciente?.telefono || "",
      email: values.paciente?.email || "",
      fechaNacimiento: values.paciente?.fechaNacimiento || "",
      sexo: values.paciente?.sexo || "",
    },
    medicoId: Number(values.medicoId),
    inicio: toISO(values.inicio),
    fin: toISO(values.fin),
    motivo: values.motivo || "",
    estado: "PROGRAMADA",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  validate(payload);
  all.push(payload); writeAll(all);
  return sleep(payload);
}

/** EDITAR: una vez creada, SOLO se permite cambiar { estado, fin } */
export async function updateCita(id, values) {
  const all = readAll();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Cita no encontrada.");
  const prev = all[idx];

  const nextEstado = values.estado !== undefined ? String(values.estado).toUpperCase() : prev.estado;
  if (!ESTADOS.includes(nextEstado)) throw new Error("Estado inválido.");

  const merged = {
    ...prev,
    estado: nextEstado,
    fin: values.fin !== undefined ? toISO(values.fin) : prev.fin,
    updatedAt: new Date().toISOString(),
  };

  validate(merged);
  all[idx] = merged; writeAll(all);
  return sleep(merged);
}

/** Eliminar: NO se puede si está PROGRAMADA */
export async function deleteCita(id) {
  const all = readAll();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Cita no encontrada.");
  if (all[idx].estado === "PROGRAMADA") throw new Error("No puedes eliminar una cita en estado PROGRAMADA.");
  all.splice(idx, 1); writeAll(all);
  return sleep({ ok: true });
}

export const CITA_ESTADOS = ESTADOS;
