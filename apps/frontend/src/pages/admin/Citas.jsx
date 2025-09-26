import { useEffect, useMemo, useState } from "react";
import { Plus, CalendarDays, Search, AlertTriangle } from "lucide-react";
import Pagination from "../../components/shared/Pagination";
import CitaTable from "../../components/cita/CitaTable";
import CitaForm from "../../components/cita/CitaForm";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Notification from "../../components/ui/Notification";

import {
    listCitas,
    createCita,
    updateCita,
    deleteCita,
    getCita,
    cancelarCitasPasadas,
} from "../../api/cita";

import { listMedicos } from "../../api/medico";
import { listHospitals } from "../../api/hospital";

export default function Citas() {
    // tabla
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(false);

    // modal crear/editar
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [serverError, setServerError] = useState("");

    // confirmación de borrado
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDelete, setToDelete] = useState(null);

    // notificaciones
    const [notification, setNotification] = useState({
        open: false,
        type: "success",
        title: "",
        message: ""
    });

    // catálogos
    const [medicos, setMedicos] = useState([]);
    const [hospitals, setHospitals] = useState([]);


    async function load() {
        setLoading(true);
        try {
            const { items, total } = await listCitas({ page, pageSize, q });
            setRows(items);
            setTotal(total);
        } catch (error) {
            console.error('Error loading citas:', error);
            setRows([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }

    // cargar catálogos una sola vez
    useEffect(() => {
        (async () => {
            try {
                // muchos elementos para que el selector tenga todo
                const [{ items: meds }, { items: hosps }] = await Promise.all([
                    listMedicos({ page: 1, pageSize: 5000, q: "" }),
                    listHospitals({ page: 1, pageSize: 5000, q: "" }),
                ]);
                setMedicos(meds);
                setHospitals(hosps);
            } catch (error) {
                console.error('Error loading catalogs:', error);
                setMedicos([]);
                setHospitals([]);
            }
        })();
    }, []);

    useEffect(() => {
        load();
    }, [page, q]);

    async function handleCreate(values) {
        try {
            setServerError("");
            await createCita(values);
            setModalOpen(false);
            setEditing(null);
            setPage(1);
            load();
            
            // Mostrar notificación de éxito
            setNotification({
                open: true,
                type: "success",
                title: "¡Cita creada!",
                message: "La cita se ha creado exitosamente",
                duration: 4000
            });
        } catch (e) {
            console.error('Error creating cita:', e);
            
            // Manejar errores específicos
            let errorMessage = "No se pudo crear la cita. Por favor, intenta nuevamente.";
            if (e.response?.status === 409) {
                errorMessage = "Ya existe una cita programada en ese horario. Por favor, selecciona otro horario.";
            } else if (e.response?.status === 400) {
                errorMessage = "Los datos proporcionados no son válidos. Por favor, revisa la información.";
            } else if (e.response?.data?.message) {
                errorMessage = e.response.data.message;
            } else if (e?.message) {
                errorMessage = e.message;
            }
            
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
            await updateCita(editing.id, values);
            setModalOpen(false);
            setEditing(null);
            load();
            
            // Mostrar notificación de éxito
            setNotification({
                open: true,
                type: "success",
                title: "¡Cita actualizada!",
                message: "La cita se ha actualizado exitosamente",
                duration: 4000
            });
        } catch (e) {
            console.error('Error updating cita:', e);
            
            // Manejar errores específicos
            let errorMessage = "No se pudo actualizar la cita. Por favor, intenta nuevamente.";
            if (e.response?.status === 409) {
                errorMessage = "Ya existe una cita programada en ese horario. Por favor, selecciona otro horario.";
            } else if (e.response?.status === 400) {
                errorMessage = "Los datos proporcionados no son válidos. Por favor, revisa la información.";
            } else if (e.response?.data?.message) {
                errorMessage = e.response.data.message;
            } else if (e?.message) {
                errorMessage = e.message;
            }
            
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

    function askDelete(c) {
        setToDelete(c);
        setConfirmOpen(true);
    }

    async function confirmDelete() {
        if (!toDelete) return;
        
        try {
            await deleteCita(toDelete.id);

            const maxPage = Math.max(1, Math.ceil((total - 1) / pageSize));
            setConfirmOpen(false);
            setToDelete(null);
            if (page > maxPage) setPage(maxPage);
            else load();
            
            // Mostrar notificación de éxito
            setNotification({
                open: true,
                type: "success",
                title: "¡Cita eliminada!",
                message: "La cita se ha eliminado exitosamente",
                duration: 4000
            });
        } catch (e) {
            console.error('Error deleting cita:', e);
            
            // Mostrar notificación de error
            setNotification({
                open: true,
                type: "error",
                title: "Error al eliminar",
                message: "No se pudo eliminar la cita. Intenta nuevamente.",
                duration: 6000
            });
        }
    }

    async function handleCancelarPasadas() {
        try {
            // Mostrar notificación de carga
            setNotification({
                open: true,
                type: "loading",
                title: "Procesando...",
                message: "Cancelando citas pasadas..."
            });

            const result = await cancelarCitasPasadas();
            console.log('Citas canceladas:', result);
            
            // Recargar la lista para mostrar los cambios
            load();
            
            // Mostrar notificación de éxito
            setNotification({
                open: true,
                type: "success",
                title: "¡Citas canceladas!",
                message: result.mensaje,
                duration: 4000
            });
        } catch (e) {
            console.error("Error cancelando citas pasadas:", e);
            
            // Mostrar notificación de error
            setNotification({
                open: true,
                type: "error",
                title: "Error",
                message: "No se pudieron cancelar las citas: " + e.message,
                duration: 6000
            });
        }
    }

    const subtitle = useMemo(
        () => (q ? `(${total} resultados)` : `${total} registros`),
        [q, total]
    );

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                        <CalendarDays size={22} className="text-emerald-600" />
                        Citas
                    </h1>
                    <p className="text-slate-600">{subtitle}</p>
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
                        onClick={handleCancelarPasadas}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                    >
                        <AlertTriangle size={16} />
                        Cancelar Pasadas
                    </button>

                    <button
                        onClick={() => {
                            setEditing(null);
                            setServerError("");
                            setModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                        <Plus size={16} />
                        Nueva cita
                    </button>
                </div>
            </div>

            {/* Tabla */}
            {loading ? (
                <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-500">
                    Cargando…
                </div>
            ) : (
                <CitaTable
                    items={rows}
                    onEdit={async (c) => {
                        try {
                            setServerError("");
                            // Cargar información completa de la cita desde el backend
                            const citaCompleta = await getCita(c.id);
                            setEditing(citaCompleta);
                            setModalOpen(true);
                        } catch (error) {
                            console.error('Error loading cita details:', error);
                            setServerError("No se pudo cargar la información de la cita.");
                        }
                    }}
                    onDelete={askDelete}
                />
            )}

            <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />

            {/* Form */}
            <CitaForm
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                initialData={editing}
                medicos={medicos}
                hospitals={hospitals}
                onSubmit={editing ? handleEdit : handleCreate}
                serverError={serverError}
            />

            {/* Confirmación eliminar */}
            <ConfirmModal
                open={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setToDelete(null);
                }}
                title="Eliminar cita"
                message={
                    toDelete ? (
                        <>
                            ¿Seguro que deseas eliminar la cita de{" "}
                            <span className="font-semibold">
                                "{toDelete.pacienteNombre || 'Sin nombre'}"
                            </span>?<br />
                            Esta acción no se puede deshacer.
                        </>
                    ) : (
                        ""
                    )
                }
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={confirmDelete}
                tone="danger"
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
