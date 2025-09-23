import { Medico } from "./medico.entity";

export class Usuario {
    constructor(
        public id: number,
        public email: string,
        public password: string,
        public rol: "ADMIN_GLOBAL" | "MEDICO",
        public activo: boolean,
        public medicoId?: number
    ) {

    }
}