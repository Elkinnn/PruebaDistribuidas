import { HospitalEspecialidad } from "../../domain/entities/hospital-especialidad.entity";
import { HospitalEspecialidadModel } from "../../data/models/hospital-especialidad.model";
import { IMapper } from "./mapper.abstract";
import { HospitalMapper } from "./hospital.mapper";
import { EspecialidadMapper } from "./especialidad.mapper";

export class HospitalEspecialidadMapper extends IMapper<HospitalEspecialidad> {
    public toDomain(model: HospitalEspecialidadModel): HospitalEspecialidad {
        if (!model) {
            throw new Error('HospitalEspecialidadModel is undefined or null');
        }
        
        const hospital = model.hospital ? new HospitalMapper().toDomain(model.hospital) : {
            id: 0,
            nombre: '',
            direccion: '',
            telefono: '',
            activo: true
        };
        
        const especialidad = model.especialidad ? new EspecialidadMapper().toDomain(model.especialidad) : {
            id: 0,
            nombre: '',
            descripcion: null
        };
        
        return new HospitalEspecialidad(
            model.id ?? 0,
            hospital,
            especialidad,
            model.hospitalId ?? 0,
            model.especialidadId ?? 0,
        );
    }

    public toModel(entity: HospitalEspecialidad): HospitalEspecialidadModel {
        if (!entity) {
            throw new Error('HospitalEspecialidad entity is undefined or null');
        }
        
        const model = new HospitalEspecialidadModel();
        model.id = entity.id;
        model.hospital = entity.hospital ? new HospitalMapper().toModel(entity.hospital) : null as any;
        model.especialidad = entity.especialidad ? new EspecialidadMapper().toModel(entity.especialidad) : null as any;
        model.hospitalId = entity.hospitalId;
        model.especialidadId = entity.especialidadId;
        
        return model;
    }
}
