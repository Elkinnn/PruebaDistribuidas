import { PacienteModel } from "../../data/models/paciente.model";
import { Paciente } from "../../domain/entities/paciente.entity";
import { HospitalMapper } from "./hospital.mapper";
import { IMapper } from "./mapper.abstract";

export class PacienteMapper extends IMapper<Paciente> {
    public toDomain(model: any): Paciente {
        if (!model) {
            throw new Error('PacienteModel is undefined or null');
        }
        
        const hospital = model.hospital ? new HospitalMapper().toDomain(model.hospital) : {
            id: 9,
            nombre: 'Hospital Central',
            direccion: '',
            telefono: '',
            activo: true
        };
        
        return new Paciente(
            model.id ?? null,
            model.nombres ?? '',
            model.apellidos ?? '',
            model.fechaNacimiento ?? new Date(),
            model.sexo as "MASCULINO" | "FEMENINO" | "OTRO" ?? 'MASCULINO',
            model.telefono ?? '',
            model.email ?? '',
            model.documento ?? null,
            model.activo ?? true,
            hospital,
        )
    }
    public toModel(entity: Paciente) {
        if (!entity) {
            throw new Error('Paciente entity is undefined or null');
        }
        
        const model = new PacienteModel()
        model.id = entity.id
        model.activo = entity.activo
        model.email = entity.email
        model.documento = entity.documento
        model.fechaNacimiento = entity.fechaNacimiento
        model.nombres = entity.nombres
        model.apellidos = entity.apellidos
        model.sexo = entity.sexo
        model.telefono = entity.telefono
        const hospitalDefault = {
            id: 9,
            nombre: 'Hospital Central',
            direccion: '',
            telefono: '',
            activo: true
        };
        model.hospital = entity.hospital ? new HospitalMapper().toModel(entity.hospital) : new HospitalMapper().toModel(hospitalDefault)
        return model
    }
}