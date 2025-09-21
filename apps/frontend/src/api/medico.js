const LS_KEY = "clinix_medicos";

function read() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
}
function write(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export async function listMedicos({ page = 1, pageSize = 8, q = "" } = {}) {
  const list = read();
  const term = q.trim().toLowerCase();
  const filtered = term
    ? list.filter((m) => {
      const hay = `${m.nombres} ${m.apellidos} ${m.email}`.toLowerCase();
      return hay.includes(term);
    })
    : list;

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  return { items, total };
}

export async function createMedico(data) {
  const list = read();

  // Regla: email único por hospital
  const dup = list.some(
    (m) =>
      Number(m.hospitalId) === Number(data.hospitalId) &&
      m.email.trim().toLowerCase() === data.email.trim().toLowerCase()
  );
  if (dup) {
    const err = new Error("Ya existe un médico con ese email en ese hospital.");
    err.code = "DUP_EMAIL_HOSPITAL";
    throw err;
  }

  const id = Date.now();
  const nuevo = {
    id,
    hospitalId: Number(data.hospitalId),
    nombres: data.nombres?.trim() || "",
    apellidos: data.apellidos?.trim() || "",
    email: data.email?.trim() || "",
    activo: Boolean(data.activo),
  };
  list.unshift(nuevo);
  write(list);
  return nuevo;
}

export async function updateMedico(id, data) {
  const list = read();
  const idx = list.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error("Médico no encontrado.");

  // Validar duplicado (excluyendo el mismo id)
  const dup = list.some(
    (m) =>
      m.id !== id &&
      Number(m.hospitalId) === Number(data.hospitalId) &&
      m.email.trim().toLowerCase() === data.email.trim().toLowerCase()
  );
  if (dup) {
    const err = new Error("Ya existe un médico con ese email en ese hospital.");
    err.code = "DUP_EMAIL_HOSPITAL";
    throw err;
  }

  list[idx] = {
    ...list[idx],
    hospitalId: Number(data.hospitalId),
    nombres: data.nombres?.trim() || "",
    apellidos: data.apellidos?.trim() || "",
    email: data.email?.trim() || "",
    activo: Boolean(data.activo),
  };
  write(list);
  return list[idx];
}

export async function deleteMedico(id) {
  const list = read();
  const next = list.filter((m) => m.id !== id);
  write(next);
  return { ok: true };
}
