// src/pages/medico/Citas.jsx
import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/shared/Pagination";
import MedicoCitaForm from "../../components/medico_cita/MedicoCitaForm";
// Si tu API está en src/api/cita.js cambia la import a "../../api/cita"
import { listCitas, createCita, updateCita, deleteCita } from "../../api/medico_cita";

function isoToLocal(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  if (isNaN(d)) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* --- Toast (alerta bonita) ------------------------------- */
function Toast({ open, type = "success", text, onClose }) {
  if (!open) return null;
  const palette =
    type === "success"
      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
      : "bg-rose-50 text-rose-800 ring-1 ring-rose-200";

  return (
    <div className="fixed top-4 right-4 z-[60]">
      <div className={`max-w-sm rounded-xl shadow-lg px-4 py-3 ${palette} backdrop-blur`}>
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            {type === "success" ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm-1.1-6.1 6.3-6.3-1.4-1.4-4.9 4.9-2.1-2.1-1.4 1.4 3.5 3.5z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 7h2v6h-2V7zm0 8h2v2h-2v-2zm1-13C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
            )}
          </div>
          <div className="text-sm leading-5">{text}</div>
          <button
            onClick={onClose}
            className="ml-2 rounded-lg px-2 py-1 text-xs/5 hover:bg-black/5"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
/* -------------------------------------------------------- */

export default function Citas() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);       // objeto cita o null
  const [items, setItems] = useState([]);             // página actual
  const [total, setTotal] = useState(0);              // total registros
  const [page, setPage] = useState(1);                // página actual
  const pageSize = 4;                                  // ← paginación 4 en 4

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");                 // mensaje para el form
  const [q, setQ] = useState("");

  // toast state
  const [toast, setToast] = useState({ open: false, type: "success", text: "" });
  const showToast = (text, type = "success") => {
    setToast({ open: true, type, text });
    // autocierre
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast((t) => ({ ...t, open: false })), 3200);
  };

  // confirmación eliminar
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // bloquear scroll del body con modal abierto
  useEffect(() => {
    if (open || confirmOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open, confirmOpen]);

  const emptyForm = useMemo(
    () => ({
      medicoId: "",
      inicio: "",
      fin: "",
      motivo: "",
      estado: "PROGRAMADA",
      paciente: {
        nombres: "",
        apellidos: "",
        documento: "",
        telefono: "",
        email: "",
        fechaNacimiento: "",
        sexo: "masculino", // el form lo resetea a "" en modo crear
      },
    }),
    []
  );
  const [form, setForm] = useState(emptyForm);

  // mock de médicos (cámbialo por tu API real si ya la tienes)
  const medicos = [
    { id: 1, nombre: "Dra. Ana Martínez" },
    { id: 2, nombre: "Dr. Luis Pérez" },
    { id: 3, nombre: "Dra. Sofía Delgado" },
  ];

  async function load(p = page) {
    setLoading(true);
    try {
      const { items, total } = await listCitas({ q, page: p, pageSize });
      setItems(items);
      setTotal(total);
    } finally {
      setLoading(false);
    }
  }

  // cuando cambia la búsqueda, vuelve a la primera página
  useEffect(() => { setPage(1); }, [q]);

  // cargar cada vez que cambie page o q
  useEffect(() => { load(page); /* eslint-disable-next-line */ }, [page, q]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setMsg("");
    setOpen(true);
  }

  function openEdit(cita) {
    setEditing(cita);
    setForm({
      medicoId: cita.medicoId,
      inicio: isoToLocal(cita.inicio),
      fin: isoToLocal(cita.fin),
      motivo: cita.motivo || "",
      estado: cita.estado || "PROGRAMADA",
      paciente: {
        nombres: cita.paciente?.nombres || "",
        apellidos: cita.paciente?.apellidos || "",
        documento: cita.paciente?.documento || "",
        telefono: cita.paciente?.telefono || "",
        email: cita.paciente?.email || "",
        fechaNacimiento: cita.paciente?.fechaNacimiento || "",
        sexo: cita.paciente?.sexo || "masculino",
      },
    });
    setMsg("");
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    try {
      if (editing) {
        // solo estado y fin
        await updateCita(editing.id, { estado: form.estado, fin: form.fin });
        setMsg("Cita actualizada exitosamente.");
        showToast("Cita actualizada correctamente.", "success");
      } else {
        await createCita(form);
        setMsg("Cita creada exitosamente.");
        showToast("Cita creada correctamente.", "success");
      }
      setOpen(false);
      setForm(emptyForm);
      // recargar página actual (o la primera si acabas de crear)
      await load(editing ? page : 1);
      if (!editing) setPage(1);
    } catch (err) {
      setMsg(err.message || "Error al guardar.");
      showToast(err.message || "Error al guardar.", "error");
    }
  }

  function askDelete(id) {
    setDeleteId(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    try {
      await deleteCita(deleteId); // bloquea si está PROGRAMADA
      await load();
      showToast("Cita eliminada correctamente.", "success");
    } catch (e) {
      // error “No puedes eliminar una cita en estado PROGRAMADA.” u otros
      showToast(e.message || "No se pudo eliminar la cita.", "error");
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  }

  function cancelDelete() {
    setConfirmOpen(false);
    setDeleteId(null);
  }

  return (
    // ⬇️ contenedor relativo (no cambia nada visual)
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Citas</h1>
          <p className="text-slate-600">
            {q ? `(${total} resultados)` : `${total} registros`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar (paciente, motivo, estado)…"
            className="w-56 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          />
          <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700">
            Nueva Cita
          </Button>
        </div>
      </div>

      {/* Lista (página actual) */}
      <div className="grid gap-4">
        {loading && <p className="text-slate-500 text-sm">Cargando…</p>}
        {!loading && items.length === 0 && (
          <Card className="p-6">
            <p className="text-slate-500 text-sm">No hay citas.</p>
          </Card>
        )}
        {items.map((c) => {
          const nombre = `${c.paciente?.nombres || ""} ${c.paciente?.apellidos || ""}`.trim();
          const i = new Date(c.inicio), f = new Date(c.fin);
          const fecha = i.toLocaleDateString();
          const hora = `${i.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — ${f.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
          const badge =
            c.estado === "PROGRAMADA" ? "bg-blue-100 text-blue-700" :
            c.estado === "ATENDIDA"   ? "bg-gray-200 text-gray-700" :
                                         "bg-rose-100 text-rose-700";
          return (
            <Card key={c.id} className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{nombre || "Paciente"}</h3>
                  <p className="text-slate-600">{c.motivo || "—"}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                      </svg>
                      {fecha}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                      </svg>
                      {hora}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge}`}>
                    {c.estado.charAt(0) + c.estado.slice(1).toLowerCase()}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(c)}>Editar</Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => askDelete(c.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ⬇️ Paginación SIEMPRE abajo */}
      {!loading && total > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-20">
          {/* ajusta 16rem si deseas mover más/menos a la izquierda */}
          <div className="w-[calc(100%-16rem)] ml-auto px-6 py-3 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-t-lg shadow">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onChange={setPage}
            />
          </div>
        </div>
      )}

      {/* Modal con formulario reusable */}
      <Modal open={open} onClose={() => { setOpen(false); setMsg(""); }} width="max-w-3xl">
        <MedicoCitaForm
          form={form}
          setForm={setForm}
          medicos={medicos}
          locked={Boolean(editing)}      // al editar: solo Estado y Fin
          onCancel={() => { setOpen(false); setMsg(""); }}
          onSubmit={handleSubmit}
          submitLabel="Guardar"
          title={editing ? "Editar Cita" : "Nueva Cita"}
          subtitle="Agenda una nueva consulta médica"
          msg={msg}
        />
      </Modal>

      {/* Confirmación eliminar */}
      <Modal open={confirmOpen} onClose={cancelDelete} width="max-w-md">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-slate-900">Eliminar cita</h3>
          <p className="text-slate-600 mt-2">
            ¿Deseas eliminar esta cita? Esta acción no se puede deshacer.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={cancelDelete}>Cancelar</Button>
            <Button className="bg-rose-600 hover:bg-rose-700" onClick={confirmDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast superior-derecha */}
      <Toast
        open={toast.open}
        type={toast.type}
        text={toast.text}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </div>
  );
}
