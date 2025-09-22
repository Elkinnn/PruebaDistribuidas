import { useEffect, useMemo, useState } from "react";
import { Plus, Building2, Search, AlertTriangle } from "lucide-react";
import HospitalTable from "../../components/hospital/HospitalTable";
import HospitalFormModal from "../../components/hospital/HospitalForm";
import Pagination from "../../components/shared/Pagination";
import ConfirmModal from "../../components/ui/ConfirmModal";
import {
    listHospitals,
    createHospital,
    updateHospital,
    deleteHospital,
} from "../../api/hospital";

export default function Hospitales() {
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    // modal de confirmación de borrado
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDelete, setToDelete] = useState(null);

    async function load() {
        setLoading(true);
        const { items, total } = await listHospitals({ page, pageSize, q });
        setRows(items);
        setTotal(total);
        setLoading(false);
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, q]);

    async function handleCreate(values) {
        await createHospital(values);
        setModalOpen(false);
        setEditing(null);
        setPage(1); // ir al inicio para ver el nuevo
        load();
    }

    async function handleEdit(values) {
        await updateHospital(editing.id, values);
        setModalOpen(false);
        setEditing(null);
        load();
    }

    // Abrir modal de confirmación
    function askDelete(h) {
        setToDelete(h);
        setConfirmOpen(true);
    }

    // Confirmar borrado
    async function confirmDelete() {
        if (!toDelete) return;
        await deleteHospital(toDelete.id);

        // ajustar paginación si se borra el último de la página
        const newTotal = total - 1;
        const maxPage = Math.max(1, Math.ceil(newTotal / pageSize));

        setConfirmOpen(false);
        setToDelete(null);

        if (page > maxPage) setPage(maxPage);
        else load();
    }

    const filteredTitle = useMemo(
        () => (q ? `(${total} resultados)` : `${total} registros`),
        [q, total]
    );

    return (
        <div className="space-y-4">
            {/* Encabezado con botón a la DERECHA */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                        <Building2 size={22} className="text-emerald-600" />
                        Hospitales
                    </h1>
                    <p className="text-slate-600">{filteredTitle}</p>
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
                            setModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                        <Plus size={16} />
                        Nuevo hospital
                    </button>
                </div>
            </div>

            {/* Tabla */}
            {loading ? (
                <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-500">
                    Cargando…
                </div>
            ) : (
                <HospitalTable
                    items={rows}
                    onEdit={(h) => {
                        setEditing(h);
                        setModalOpen(true);
                    }}
                    onDelete={askDelete}
                />
            )}

            {/* Paginación */}
            <Pagination
                page={page}
                pageSize={pageSize}
                total={total}
                onChange={setPage}
            />

            {/* Modal Crear/Editar */}
            <HospitalFormModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                initialData={editing}
                onSubmit={editing ? handleEdit : handleCreate}
            />

            {/* Modal de confirmación de borrado */}
            <ConfirmModal
                open={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setToDelete(null);
                }}
                title="Eliminar hospital"
                message={
                    <>
                        ¿Seguro que deseas eliminar{" "}
                        <span className="font-semibold">“{toDelete?.nombre}”</span>?<br />
                        Esta acción no se puede deshacer.
                    </>
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
