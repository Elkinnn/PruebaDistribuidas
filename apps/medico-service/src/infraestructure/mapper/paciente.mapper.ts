import { PacienteModel } from "../../data/models/paciente.model";
import { Paciente } from "../../domain/entities/paciente.entity";
import { HospitalMapper } from "./hospital.mapper";
import { IMapper } from "./mapper.abstract";

export class PacienteMapper extends IMapper<Paciente> {
    public toDomain(model: any): Paciente {
        return new Paciente(
            model.id ?? null,
            model.nombres,
            model.apellidos,
            model.fechaNacimiento,
            model.sexo,
            model.telefono,
            model.email,
            model.activo,
            new HospitalMapper().toDomain(model.hospital),
        )
    }
    public toModel(entity: Paciente) {
        const model = new PacienteModel()
        model.id = entity.id
        model.activo = entity.activo
        model.email = entity.email
        model.fechaNacimiento = entity.fechaNacimiento
        model.nombres = entity.nombres
        model.apellidos = entity.apellidos
        model.sexo = entity.sexo
        model.telefono = entity.telefono
        model.hospital = new HospitalMapper().toModel(entity.hospital)
        return model
    }
}