import { HospitalModel } from "../../data/models/hospital.model";
import { Hospital } from "../../domain/entities/hospital.entity";
import { IMapper } from "./mapper.abstract";

export class HospitalMapper extends IMapper<Hospital> {
    public toDomain(model: any): Hospital {
        return new Hospital(
            model.id ?? null, 
            model.nombre,
            model.direccion,
            model.telefono,
            model.activo,
        )
    }
    public toModel(entity: Hospital) {
        const model = new HospitalModel()
        model.id = entity.id
        model.nombre = entity.nombre
        model.activo = entity.activo
        model.direccion = entity.direccion
        model.telefono = entity.telefono
        return model
    }
}