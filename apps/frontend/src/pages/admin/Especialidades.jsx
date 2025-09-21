import { useEffect, useMemo, useState } from "react";
import { Plus, Stethoscope, Search, AlertTriangle } from "lucide-react";
import Pagination from "../../components/shared/Pagination";
import EspecialidadTable from "../../components/especialidad/EspecialidadTable";
import EspecialidadFormModal from "../../components/especialidad/EspecialidadFormModal";
import ConfirmModal from "../../components/ui/ConfirmModal";

import {
    listEspecialidades,
    createEspecialidad,
    updateEspecialidad,
    deleteEspecialidad,
} from "../../api/especialidad";

export default function Especialidades() {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [serverError, setServerError] = useState("");

    const [confirm, setConfirm] = useState({ open: false, item: null });

    async function load() {
        setLoading(true);
        const { items, total } = await listEspecialidades({ page, pageSize, q });
        setItems(items);
        setTotal(total);
        setLoading(false);
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, q]);

    async function handleCreate(values) {
        try {
            setServerError("");
            await createEspecialidad(values);
            setModalOpen(false);
            setEditing(null);
            setPage(1);
            load();
        } catch (e) {
            setServerError(e?.message || "No se pudo crear.");
        }
    }

    async function handleEdit(values) {
        try {
            setServerError("");
            await updateEspecialidad(editing.id, values);
            setModalOpen(false);
            setEditing(null);
            load();
        } catch (e) {
            setServerError(e?.message || "No se pudo actualizar.");
        }
    }

    function askDelete(item) {
        setConfirm({ open: true, item });
    }

    async function onConfirmDelete() {
        const item = confirm.item;
        if (!item) return;
        await deleteEspecialidad(item.id);
        setConfirm({ open: false, item: null });

        const maxPage = Math.max(1, Math.ceil((total - 1) / pageSize));
        if (page > maxPage) setPage(maxPage);
        else load();
    }

    const headerSubtitle = useMemo(
        () => (q ? `(${total} resultados)` : `${total} registros`),
        [q, total]
    );

    return (
        <div className="space-y-4">
            {/* Header con acción a la derecha */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                        <Stethoscope size={22} className="text-emerald-600" />
                        Especialidades
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
                        Nueva especialidad
                    </button>
                </div>
            </div>

            {/* Tabla */}
            {loading ? (
                <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-500">
                    Cargando…
                </div>
            ) : (
                <EspecialidadTable
                    items={items}
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
            <EspecialidadFormModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                initialData={editing}
                onSubmit={editing ? handleEdit : handleCreate}
                serverError={serverError}
            />

            {/* Confirmación de borrado (usando la API correcta del ConfirmModal) */}
            <ConfirmModal
                open={confirm.open}
                onClose={() => setConfirm({ open: false, item: null })}
                title="Eliminar especialidad"
                message={
                    <>
                        ¿Seguro que deseas eliminar{" "}
                        <span className="font-semibold">“{confirm.item?.nombre}”</span>?
                        <br />
                        Esta acción no se puede deshacer.
                    </>
                }
                confirmText="Eliminar"
                cancelText="Cancelar"
                tone="danger"
                onConfirm={onConfirmDelete}
            />

            {/* Nota mock */}
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <AlertTriangle size={14} />
                Datos en localStorage (mock). Luego conectamos al backend real.
            </div>
        </div>
    );
}
