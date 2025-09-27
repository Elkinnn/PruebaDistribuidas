import { Especialidad } from "../../domain/entities/especialidad.entity";
import { EspecialidadModel } from "../../data/models/especialidad.model";
import { IMapper } from "./mapper.abstract";

export class EspecialidadMapper extends IMapper<Especialidad> {
    public toDomain(model: EspecialidadModel): Especialidad {
        if (!model) {
            throw new Error('EspecialidadModel is undefined or null');
        }
        
        return new Especialidad(
            model.id ?? 0,
            model.nombre ?? '',
            model.descripcion ?? null,
        );
    }

    public toModel(entity: Especialidad): EspecialidadModel {
        if (!entity) {
            throw new Error('Especialidad entity is undefined or null');
        }
        
        const model = new EspecialidadModel();
        model.id = entity.id;
        model.nombre = entity.nombre;
        model.descripcion = entity.descripcion;
        
        return model;
    }
}
