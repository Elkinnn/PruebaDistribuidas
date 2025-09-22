import { useEffect, useMemo, useState } from "react";
import { Plus, CalendarDays, Search, AlertTriangle } from "lucide-react";
import Pagination from "../../components/shared/Pagination";
import CitaTable from "../../components/cita/CitaTable";
import CitaForm from "../../components/cita/CitaForm";
import ConfirmModal from "../../components/ui/ConfirmModal";

import {
    listCitas,
    createCita,
    updateCita,
    deleteCita,
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

    // catálogos
    const [medicos, setMedicos] = useState([]);
    const [hospitals, setHospitals] = useState([]);

    const medicoMap = useMemo(
        () =>
            medicos.reduce((acc, m) => {
                acc[m.id] = `${m.nombres} ${m.apellidos}`;
                return acc;
            }, {}),
        [medicos]
    );

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
        const { items, total } = await listCitas({ page, pageSize, q });
        setRows(items);
        setTotal(total);
        setLoading(false);
    }

    // cargar catálogos una sola vez
    useEffect(() => {
        (async () => {
            // muchos elementos para que el selector tenga todo
            const [{ items: meds }, { items: hosps }] = await Promise.all([
                listMedicos({ page: 1, pageSize: 5000, q: "" }),
                listHospitals({ page: 1, pageSize: 5000, q: "" }),
            ]);
            setMedicos(meds);
            setHospitals(hosps);
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
        } catch (e) {
            setServerError(e?.message || "No se pudo crear la cita.");
        }
    }

    async function handleEdit(values) {
        try {
            setServerError("");
            await updateCita(editing.id, values);
            setModalOpen(false);
            setEditing(null);
            load();
        } catch (e) {
            setServerError(e?.message || "No se pudo actualizar la cita.");
        }
    }

    function askDelete(c) {
        setToDelete(c);
        setConfirmOpen(true);
    }

    async function confirmDelete() {
        if (!toDelete) return;
        await deleteCita(toDelete.id);

        const maxPage = Math.max(1, Math.ceil((total - 1) / pageSize));
        setConfirmOpen(false);
        setToDelete(null);
        if (page > maxPage) setPage(maxPage);
        else load();
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
                    medicoMap={medicoMap}
                    hospitalMap={hospitalMap}
                    onEdit={(c) => {
                        setEditing(c);
                        setServerError("");
                        setModalOpen(true);
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
                            ¿Confirmas eliminar la cita de{" "}
                            <span className="font-semibold">
                                “{toDelete.paciente || toDelete.pacienteInfo?.nombres}”
                            </span>
                            ?
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

            {/* Nota mock */}
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <AlertTriangle size={14} />
                Datos en localStorage (mock). Luego conectamos al backend real.
            </div>
        </div>
    );
}
