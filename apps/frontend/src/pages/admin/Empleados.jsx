import { useEffect, useMemo, useState } from "react";
import { Plus, Users, Search, AlertTriangle } from "lucide-react";
import Pagination from "../../components/shared/Pagination";
import EmpleadoTable from "../../components/empleado/EmpleadoTable";
import EmpleadoForm from "../../components/empleado/EmpleadoForm";
import ConfirmModal from "../../components/ui/ConfirmModal";

import { listEmpleados, createEmpleado, updateEmpleado, deleteEmpleado } from "../../api/empleado";
import { listHospitals } from "../../api/hospital";

export default function Empleados() {
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [serverError, setServerError] = useState("");

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDelete, setToDelete] = useState(null);

    const [hospitals, setHospitals] = useState([]);
    const hospitalMap = useMemo(
        () =>
            hospitals.reduce((acc, h) => {
                acc[h.id] = h.nombre;
                return acc;
            }, {}),
        [hospitals]
    );

    async function load() {
        setLoading(true);
        const { items, total } = await listEmpleados({ page, pageSize, q });
        setRows(items);
        setTotal(total);
        setLoading(false);
    }

    async function loadHospitalsAll() {
        const { items } = await listHospitals({ page: 1, pageSize: 5000, q: "" });
        setHospitals(items);
    }

    useEffect(() => {
        loadHospitalsAll();
    }, []);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, q]);

    async function handleCreate(values) {
        try {
            setServerError("");
            await createEmpleado(values);
            setModalOpen(false);
            setEditing(null);
            setPage(1);
            load();
        } catch (e) {
            setServerError(e?.message || "No se pudo crear el empleado.");
        }
    }

    async function handleEdit(values) {
        try {
            setServerError("");
            await updateEmpleado(editing.id, values);
            setModalOpen(false);
            setEditing(null);
            load();
        } catch (e) {
            setServerError(e?.message || "No se pudo actualizar el empleado.");
        }
    }

    function askDelete(item) {
        setToDelete(item);
        setConfirmOpen(true);
    }

    async function confirmDelete() {
        if (!toDelete) return;
        await deleteEmpleado(toDelete.id);
        const maxPage = Math.max(1, Math.ceil((total - 1) / pageSize));
        setConfirmOpen(false);
        setToDelete(null);
        if (page > maxPage) setPage(maxPage);
        else load();
    }

    const headerSubtitle = useMemo(
        () => (q ? `(${total} resultados)` : `${total} registros`),
        [q, total]
    );

    return (
        <div className="space-y-4">
            {/* Header con botón a la derecha */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                        <Users size={22} className="text-emerald-600" />
                        Empleados
                    </h1>
                    <p className="text-slate-600">{headerSubtitle}</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            value={q}
                            onChange={(e) => {
                                setPage(1);
                                setQ(e.target.value);
                            }}
                            placeholder="Buscar…"
                            className="w-52 rounded-xl border border-slate-300 pl-8 pr-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                        />
                    </div>

                    <button
                        onClick={() => {
                            setEditing(null);
                            setServerError("");
                            setModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                        <Plus size={16} />
                        Nuevo empleado
                    </button>
                </div>
            </div>

            {/* Tabla */}
            {loading ? (
                <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-500">
                    Cargando…
                </div>
            ) : (
                <EmpleadoTable
                    items={rows}
                    hospitalMap={hospitalMap}
                    onEdit={(e) => {
                        setEditing(e);
                        setServerError("");
                        setModalOpen(true);
                    }}
                    onDelete={askDelete}
                />
            )}

            {/* Paginación */}
            <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />

            {/* Modal Crear/Editar */}
            <EmpleadoForm
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                initialData={editing}
                onSubmit={editing ? handleEdit : handleCreate}
                hospitals={hospitals}
                serverError={serverError}
            />

            {/* Confirmación de borrado */}
            <ConfirmModal
                open={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setToDelete(null);
                }}
                tone="danger"
                title="Eliminar empleado"
                message={
                    toDelete ? (
                        <>
                            ¿Seguro que deseas eliminar a{" "}
                            <span className="font-semibold">
                                “{toDelete.nombres} {toDelete.apellidos}”
                            </span>
                            ?<br />
                            Esta acción no se puede deshacer.
                        </>
                    ) : (
                        ""
                    )
                }
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={confirmDelete}
            />

            {/* Nota de conexión */}
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                <AlertTriangle size={14} />
                Datos conectados al backend real a través del API Gateway.
            </div>
        </div>
    );
}
