import { useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";

export default function Citas() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    pacienteNombre: "", 
    motivo: "", 
    fechaInicio: "", 
    horaInicio: "",
    fechaFin: "",
    horaFin: ""
  });
  const [msg, setMsg] = useState("");

  // Datos de prueba de citas
  const citas = [
    {
      id: 1,
      paciente: "Juan Pérez",
      motivo: "Consulta de rutina",
      fecha: "2024-01-15",
      hora: "09:00 - 10:00",
      estado: "Programada"
    },
    {
      id: 2,
      paciente: "María García",
      motivo: "Seguimiento post-operatorio",
      fecha: "2024-01-15",
      hora: "11:00 - 12:00",
      estado: "Programada"
    },
    {
      id: 3,
      paciente: "Carlos López",
      motivo: "Revisión de resultados",
      fecha: "2024-01-16",
      hora: "14:00 - 15:00",
      estado: "Completada"
    }
  ];

  function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    
    const { pacienteNombre, motivo, fechaInicio, horaInicio, fechaFin, horaFin } = form;
    
    if (!pacienteNombre || !motivo || !fechaInicio || !horaInicio || !fechaFin || !horaFin) {
      return setMsg("Completa todos los campos.");
    }

    // Validaciones básicas
    const inicio = new Date(`${fechaInicio}T${horaInicio}`);
    const fin = new Date(`${fechaFin}T${horaFin}`);
    const ahora = new Date();

    if (inicio < ahora) {
      return setMsg("La fecha de inicio no puede estar en el pasado.");
    }

    if (fin <= inicio) {
      return setMsg("La fecha de fin debe ser mayor que la de inicio.");
    }

    // Simular creación exitosa
    setMsg("Cita creada exitosamente.");
    setOpen(false);
    setForm({ 
      pacienteNombre: "", 
      motivo: "", 
      fechaInicio: "", 
      horaInicio: "",
      fechaFin: "",
      horaFin: ""
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Citas</h1>
          <p className="text-slate-600">Administra tus citas médicas</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          Nueva Cita
        </Button>
      </div>

      {/* Lista de Citas */}
      <div className="grid gap-4">
        {citas.map((cita) => (
          <Card key={cita.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">{cita.paciente}</h3>
                <p className="text-slate-600">{cita.motivo}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {cita.fecha}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {cita.hora}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  cita.estado === 'Programada' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {cita.estado}
                </span>
                {cita.estado === 'Programada' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Editar</Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de Nueva Cita */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Nueva Cita</h3>
              <p className="text-slate-600">Agenda una nueva consulta médica</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información de la Cita */}
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Información de la Cita
              </h4>
              <p className="text-sm text-slate-600 mb-4">Completa todos los campos para agendar una nueva cita</p>
            </div>

            {/* Información del Paciente */}
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Información del Paciente
              </h4>
              
              <div className="space-y-4">
                <Input
                  label="Nombre del Paciente *"
                  placeholder="Ingresa el nombre completo del paciente"
                  value={form.pacienteNombre}
                  onChange={(e) => setForm(prev => ({ ...prev, pacienteNombre: e.target.value }))}
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Motivo de la Consulta *
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 resize-none"
                    placeholder="Describe el motivo de la consulta"
                    rows={3}
                    value={form.motivo}
                    onChange={(e) => setForm(prev => ({ ...prev, motivo: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Fecha y Hora */}
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Fecha y Hora
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha de Inicio *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                      value={form.fechaInicio}
                      onChange={(e) => setForm(prev => ({ ...prev, fechaInicio: e.target.value }))}
                      required
                    />
                    <svg className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hora de Inicio *
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                      value={form.horaInicio}
                      onChange={(e) => setForm(prev => ({ ...prev, horaInicio: e.target.value }))}
                      required
                    />
                    <svg className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha de Fin *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                      value={form.fechaFin}
                      onChange={(e) => setForm(prev => ({ ...prev, fechaFin: e.target.value }))}
                      required
                    />
                    <svg className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hora de Fin *
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                      value={form.horaFin}
                      onChange={(e) => setForm(prev => ({ ...prev, horaFin: e.target.value }))}
                      required
                    />
                    <svg className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {msg && (
              <div className={`rounded-lg p-3 text-sm ${
                msg.includes('exitosamente') 
                  ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                  : 'bg-red-50 text-red-700 ring-1 ring-red-200'
              }`}>
                {msg}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                Crear Cita
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
