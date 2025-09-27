import { Hospital } from "./hospital.entity";

export class Paciente {
    constructor(
        public id: number,
        public nombres: string,
        public apellidos: string,
        public fechaNacimiento: Date | null,
        public sexo: "MASCULINO" | "FEMENINO" | "OTRO",
        public telefono: string | null,
        public email: string | null,
        public documento: string | null,
        public activo: boolean,
        public hospital: Hospital,
    ) {

    }
}