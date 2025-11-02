import { useEffect, useMemo, useState } from "react";
import { Plus, Stethoscope, Search, AlertTriangle } from "lucide-react";
import Pagination from "../../components/shared/Pagination";
import EspecialidadTable from "../../components/especialidad/EspecialidadTable";
import EspecialidadFormModal from "../../components/especialidad/EspecialidadFormModal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Notification from "../../components/ui/Notification";

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

    // notificaciones
    const [notification, setNotification] = useState({
        open: false,
        type: "success",
        title: "",
        message: ""
    });

    async function load() {
        setLoading(true);
        try {
            const res = await listEspecialidades({ page, pageSize, q });
            const { items = [], total = 0, degraded, _stale } = res.data || res || {};
            
            setItems(items);
            setTotal(total);
            
            // Mostrar advertencia si está degraded o stale
            if (degraded || _stale) {
                const message = _stale 
                    ? "Mostrando datos en caché (pueden estar desactualizados)"
                    : "Datos no disponibles temporalmente";
                setNotification({
                    title: "Advertencia",
                    message,
                    variant: "warning"
                });
            }
        } catch (error) {
            console.error('Error loading especialidades:', error);
            setItems([]);
            setTotal(0);
            
            // Manejar Circuit Breaker específicamente
            let errorMessage = "No se pudieron cargar las especialidades. Por favor, intenta nuevamente.";
            if (error.status === 503 || error.isCircuitOpen) {
                errorMessage = "El servicio está temporalmente no disponible. Por favor, intenta nuevamente en unos momentos.";
            } else if (error.response?.status === 503) {
                errorMessage = error.response?.data?.message || "El servicio está temporalmente no disponible. Por favor, intenta nuevamente en unos momentos.";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setNotification({
                open: true,
                type: "error",
                title: "Error al cargar",
                message: errorMessage,
                duration: 6000
            });
        } finally {
            setLoading(false);
        }
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
            
            // Mostrar notificación de éxito
            setNotification({
                open: true,
                type: "success",
                title: "¡Especialidad creada!",
                message: "La especialidad se ha creado exitosamente",
                duration: 4000
            });
        } catch (e) {
            // Mostrar mensaje de error específico del backend
            const errorMessage = e?.message || "No se pudo crear la especialidad.";
            setServerError(errorMessage);
            
            // Mostrar notificación de error
            setNotification({
                open: true,
                type: "error",
                title: "Error al crear",
                message: errorMessage,
                duration: 6000
            });
        }
    }

    async function handleEdit(values) {
        try {
            setServerError("");
            await updateEspecialidad(editing.id, values);
            setModalOpen(false);
            setEditing(null);
            load();
            
            // Mostrar notificación de éxito
            setNotification({
                open: true,
                type: "success",
                title: "¡Especialidad actualizada!",
                message: "La especialidad se ha actualizado exitosamente",
                duration: 4000
            });
        } catch (e) {
            // Mostrar mensaje de error específico del backend
            const errorMessage = e?.message || "No se pudo actualizar la especialidad.";
            setServerError(errorMessage);
            
            // Mostrar notificación de error
            setNotification({
                open: true,
                type: "error",
                title: "Error al actualizar",
                message: errorMessage,
                duration: 6000
            });
        }
    }

    function askDelete(item) {
        setConfirm({ open: true, item });
    }

    async function onConfirmDelete() {
        const item = confirm.item;
        if (!item) return;
        
        try {
            await deleteEspecialidad(item.id);
            setConfirm({ open: false, item: null });

            const maxPage = Math.max(1, Math.ceil((total - 1) / pageSize));
            if (page > maxPage) setPage(maxPage);
            else load();
            
            // Mostrar notificación de éxito
            setNotification({
                open: true,
                type: "success",
                title: "¡Especialidad eliminada!",
                message: "La especialidad se ha eliminado exitosamente",
                duration: 4000
            });
        } catch (e) {
            console.error('Error deleting especialidad:', e);
            
            // Mostrar notificación de error
            setNotification({
                open: true,
                type: "error",
                title: "Error al eliminar",
                message: "No se pudo eliminar la especialidad. Intenta nuevamente.",
                duration: 6000
            });
        }
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
                        ¿Seguro que deseas eliminar la especialidad{" "}
                        <span className="font-semibold">"{confirm.item?.nombre}"</span>?<br />
                        Esta acción no se puede deshacer.
                    </>
                }
                confirmText="Eliminar"
                cancelText="Cancelar"
                tone="danger"
                onConfirm={onConfirmDelete}
            />


            {/* Notificación */}
            <Notification
                open={notification.open}
                onClose={() => setNotification(prev => ({ ...prev, open: false }))}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                duration={notification.duration}
            />
        </div>
    );
}
