import { Hospital } from "./hospital.entity";
import { Medico } from "./medico.entity";
import { Paciente } from "./paciente.entity";
import { Usuario } from "./usuario.model";

export class Cita {
    constructor(
        public id: number,
        public motivo: string,
        public estado: "PROGRAMADA" | "CANCELADA" | "ATENDIDA",
        public fechaInicio: Date,
        public fechaFin: Date,
        public medico: Medico | null,
        public paciente: Paciente | null,
        public Hospital: Hospital | null,
        public creadoPor: Usuario | null,
        public actualizadaPor: Usuario | null,
        public createdAt: Date,
        public updatedAt: Date,
        // Snapshot del paciente (al momento de crear la cita)
        public pacienteNombre?: string | null,
        public pacienteTelefono?: string | null,
        public pacienteEmail?: string | null,
        public pacienteId?: number | null,
        public medicoId?: number | null,
        public hospitalId?: number | null,
    ) {

    }
}