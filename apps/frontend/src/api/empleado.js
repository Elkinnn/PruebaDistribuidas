const KEY = "clinix_empleados";

function _read() {
    try {
        const raw = localStorage.getItem(KEY);
        return Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}
function _write(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
}

export async function listEmpleados({ page = 1, pageSize = 10, q = "" }) {
    const all = _read();
    const term = q.trim().toLowerCase();

    const filtered = term
        ? all.filter((e) => {
            const hay = [
                e.nombres,
                e.apellidos,
                e.tipo,
                e.email,
                e.telefono,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return hay.includes(term);
        })
        : all;

    // orden más reciente primero
    filtered.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return new Promise((res) =>
        setTimeout(() => res({ items, total }), 200)
    );
}

export async function createEmpleado(data) {
    const all = _read();
    const nextId = (all.reduce((m, x) => Math.max(m, x.id || 0), 0) || 0) + 1;
    const item = {
        id: nextId,
        hospitalId: data.hospitalId,
        nombres: data.nombres?.trim() || "",
        apellidos: data.apellidos?.trim() || "",
        tipo: data.tipo,
        email: data.email?.trim() || "",
        telefono: data.telefono?.trim() || "",
        activo: data.activo ?? true,
    };
    all.push(item);
    _write(all);
    return new Promise((res) => setTimeout(() => res(item), 150));
}

export async function updateEmpleado(id, patch) {
    const all = _read();
    const idx = all.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error("Empleado no encontrado");
    all[idx] = {
        ...all[idx],
        ...patch,
    };
    _write(all);
    return new Promise((res) => setTimeout(() => res(all[idx]), 150));
}

export async function deleteEmpleado(id) {
    const all = _read().filter((x) => x.id !== id);
    _write(all);
    return new Promise((res) => setTimeout(() => res(true), 150));
}
