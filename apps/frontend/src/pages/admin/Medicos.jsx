import { useEffect, useMemo, useState } from "react";
import { Plus, UserCog, Search, AlertTriangle } from "lucide-react";
import Pagination from "../../components/shared/Pagination";
import MedicoTable from "../../components/medico/MedicoTable";
import MedicoForm from "../../components/medico/MedicoForm";
import ConfirmModal from "../../components/ui/ConfirmModal";

import { listMedicos, createMedico, updateMedico, deleteMedico } from "../../api/medico";
import { listHospitals, getEspecialidadesByHospital } from "../../api/hospital";

export default function Medicos() {
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
    const [delTarget, setDelTarget] = useState(null);

    const [hospitals, setHospitals] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
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
        const { items, total } = await listMedicos({ page, pageSize, q });
        setRows(items);
        setTotal(total);
        setLoading(false);
    }

    async function loadHospitalsAll() {
        // Trae muchos para el selector
        const { items } = await listHospitals({ page: 1, pageSize: 5000, q: "" });
        setHospitals(items);
    }

    async function loadEspecialidadesByHospital(hospitalId) {
        try {
            const especialidades = await getEspecialidadesByHospital(hospitalId);
            setEspecialidades(especialidades);
        } catch (error) {
            console.error('Error loading especialidades:', error);
            setEspecialidades([]);
        }
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
            await createMedico(values);
            setModalOpen(false);
            setEditing(null);
            setPage(1);
            load();
        } catch (e) {
            // Mostrar mensaje de error específico del backend
            const errorMessage = e?.message || "No se pudo crear el médico.";
            setServerError(errorMessage);
        }
    }

    async function handleEdit(values) {
        try {
            setServerError("");
            await updateMedico(editing.id, values);
            setModalOpen(false);
            setEditing(null);
            load();
        } catch (e) {
            // Mostrar mensaje de error específico del backend
            const errorMessage = e?.message || "No se pudo actualizar el médico.";
            setServerError(errorMessage);
        }
    }

    function askDelete(m) {
        setDelTarget(m);
        setConfirmOpen(true);
    }

    async function confirmDelete() {
        if (!delTarget) return;
        await deleteMedico(delTarget.id);
        const maxPage = Math.max(1, Math.ceil((total - 1) / pageSize));
        setConfirmOpen(false);
        setDelTarget(null);
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
                        <UserCog size={22} className="text-emerald-600" />
                        Médicos
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
                        Nuevo médico
                    </button>
                </div>
            </div>

            {/* Tabla */}
            {loading ? (
                <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-500">
                    Cargando…
                </div>
            ) : (
                <MedicoTable
                    items={rows}
                    hospitalMap={hospitalMap}
                    onEdit={async (m) => {
                        setEditing(m);
                        setServerError("");
                        setModalOpen(true);
                        // Cargar especialidades del hospital del médico
                        if (m.hospitalId) {
                            await loadEspecialidadesByHospital(m.hospitalId);
                        }
                    }}
                    onDelete={askDelete}
                />
            )}

            {/* Paginación */}
            <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />

            {/* Modal Crear/Editar */}
            <MedicoForm
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                    setEspecialidades([]); // Limpiar especialidades al cerrar
                }}
                initialData={editing}
                onSubmit={editing ? handleEdit : handleCreate}
                hospitals={hospitals}
                especialidades={especialidades}
                onLoadEspecialidades={loadEspecialidadesByHospital}
                serverError={serverError}
            />

            {/* Confirmar eliminación */}
            <ConfirmModal
                open={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setDelTarget(null);
                }}

                tone="danger"
                title="Eliminar médico"
                message={
                    delTarget
                        ? `¿Seguro que deseas eliminar a "${delTarget.nombres} ${delTarget.apellidos}"? Esta acción eliminará completamente el médico y su usuario de la base de datos. No se puede deshacer.`
                        : ""
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
