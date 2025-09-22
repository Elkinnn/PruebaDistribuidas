// src/api/medico_profile.js
const STORAGE_KEY = "clinix:medico_profile";
const sleep = (x) => new Promise(r => setTimeout(() => r(x), 80));

const DEFAULT_PROFILE = {
  nombre: "Dr. María Elena Rodríguez",
  especialidades: ["Cardiología", "Medicina Interna"],
  hospital: "Hospital Central San José",
  email: "maria.rodriguez@medicitas.com",
  telefono: "+1 (555) 123-4567",
  fechaIngreso: "14 de marzo de 2020",
  direccion: "Av. Principal 123, Ciudad, País",
  idMedico: "doc-001",
  diasTrabajo: ["Lun", "Mar", "Mié", "Jue", "Vie"],
  horario: "08:00 - 17:00",
};

function read() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || DEFAULT_PROFILE; }
  catch { return DEFAULT_PROFILE; }
}
function write(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

export async function getMedicoProfile() { return sleep(read()); }
export async function updateMedicoProfile(patch) {
  const curr = read();
  const next = { ...curr, ...patch };
  // normaliza especialidades (texto -> array)
  if (typeof next.especialidades === "string") {
    next.especialidades = next.especialidades
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  }
  write(next);
  return sleep(next);
}
