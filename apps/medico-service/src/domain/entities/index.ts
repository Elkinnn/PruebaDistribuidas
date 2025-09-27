import { Cita } from "./cita.entity"
import { Especialidad } from "./especialidad.entity"
import { Hospital } from "./hospital.entity"
import { HospitalEspecialidad } from "./hospital-especialidad.entity"
import { Medico } from "./medico.entity"
import { Paciente } from "./paciente.entity"
import { Usuario } from "./usuario.model"

const Entities = [
    Hospital,
    Medico,
    Paciente,
    Usuario,
    Cita,
    Especialidad,
    HospitalEspecialidad
]

export default Entities