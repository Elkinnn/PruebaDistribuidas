import { Hospital } from "./hospital.entity";
import { Usuario } from "./usuario.model";

export class Medico {
    constructor(
        public id: number,
        public nombres: string,
        public apellidos:string,
        public email: string,
        public activo: boolean,
        public usuario: Usuario,
        public hospital: Hospital,
    ) {
        
    }
}