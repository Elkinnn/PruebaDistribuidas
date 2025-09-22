const KEY = "clinix_hospitales";

function seed() {
    const exists = localStorage.getItem(KEY);
    if (!exists) {
        const demo = [
            { id: 1, nombre: "Clínica Centro", direccion: "Av. Principal 123", telefono: "099-999-111", activo: true },
            { id: 2, nombre: "Hospital Norte", direccion: "Calle 10 y F.", telefono: "02-222-333", activo: true },
            { id: 3, nombre: "Clínica Sur", direccion: "Km 4.5 Vía Sur", telefono: "07-123-456", activo: false },
            { id: 4, nombre: "San José", direccion: "Av. Libertad 500", telefono: "098-000-444", activo: true },
            { id: 5, nombre: "Metropolitano", direccion: "Av. Colón 777", telefono: "02-600-700", activo: true },
            { id: 6, nombre: "La Floresta", direccion: "Calle Larga 22-10", telefono: "04-555-666", activo: true },
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

export async function listHospitals({ page = 1, pageSize = 8, q = "" } = {}) {
    const all = readAll();
    const term = q.trim().toLowerCase();
    const filtered = term
        ? all.filter(h =>
            [h.nombre, h.direccion, h.telefono].some(v =>
                String(v || "").toLowerCase().includes(term)
            )
        )
        : all;

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return { items, total, page, pageSize };
}

export async function createHospital(data) {
    const all = readAll();
    const id = all.length ? Math.max(...all.map(h => h.id)) + 1 : 1;
    const nuevo = { id, activo: true, ...data };
    all.push(nuevo);
    writeAll(all);
    return nuevo;
}

export async function updateHospital(id, data) {
    const all = readAll();
    const idx = all.findIndex(h => h.id === id);
    if (idx === -1) throw new Error("Hospital no encontrado");
    all[idx] = { ...all[idx], ...data };
    writeAll(all);
    return all[idx];
}

export async function deleteHospital(id) {
    const all = readAll();
    const next = all.filter(h => h.id !== id);
    writeAll(next);
    return true;
}
