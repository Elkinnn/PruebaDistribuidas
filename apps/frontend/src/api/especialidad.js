const KEY = "clinix_especialidades";

function seed() {
    if (!localStorage.getItem(KEY)) {
        const demo = [
            { id: 1, nombre: "Cardiología", descripcion: "Corazón y sistema circulatorio" },
            { id: 2, nombre: "Pediatría", descripcion: "Salud infantil" },
            { id: 3, nombre: "Dermatología", descripcion: "Piel, cabello y uñas" },
            { id: 4, nombre: "Traumatología", descripcion: "Lesiones y aparato locomotor" },
            { id: 5, nombre: "Neurología", descripcion: "Sistema nervioso" },
            { id: 6, nombre: "Oncología", descripcion: "Cáncer y tumores" },
        ];
        localStorage.setItem(KEY, JSON.stringify(demo));
    }
}
seed();

function readAll() {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
}
function writeAll(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
}

export async function listEspecialidades({ page = 1, pageSize = 8, q = "" } = {}) {
    const all = readAll();
    const term = q.trim().toLowerCase();
    const filtered = term
        ? all.filter((e) =>
            [e.nombre, e.descripcion].some((v) =>
                String(v || "").toLowerCase().includes(term)
            )
        )
        : all;

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return { items, total, page, pageSize };
}

function existsNombre(nombre, omitId = null) {
    const all = readAll();
    const n = nombre.trim().toLowerCase();
    return all.some((e) => e.nombre.trim().toLowerCase() === n && e.id !== omitId);
}

export async function createEspecialidad(data) {
    if (!data?.nombre?.trim()) throw new Error("El nombre es obligatorio");
    if (existsNombre(data.nombre)) throw new Error("El nombre ya existe");
    const all = readAll();
    const id = all.length ? Math.max(...all.map((e) => e.id)) + 1 : 1;
    const nuevo = { id, nombre: data.nombre.trim(), descripcion: data.descripcion || "" };
    writeAll([...all, nuevo]);
    return nuevo;
}

export async function updateEspecialidad(id, data) {
    const all = readAll();
    const idx = all.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error("Especialidad no encontrada");
    if (!data?.nombre?.trim()) throw new Error("El nombre es obligatorio");
    if (existsNombre(data.nombre, id)) throw new Error("El nombre ya existe");
    all[idx] = { ...all[idx], nombre: data.nombre.trim(), descripcion: data.descripcion || "" };
    writeAll(all);
    return all[idx];
}

export async function deleteEspecialidad(id) {
    const all = readAll();
    writeAll(all.filter((e) => e.id !== id));
    return true;
}
