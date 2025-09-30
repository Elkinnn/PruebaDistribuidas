import { Hospital } from "./hospital.entity";
import { Especialidad } from "./especialidad.entity";

export class HospitalEspecialidad {
    constructor(
        public id: number,
        public hospital: Hospital,
        public especialidad: Especialidad,
        public hospitalId: number,
        public especialidadId: number,
    ) {
        
    }
}
