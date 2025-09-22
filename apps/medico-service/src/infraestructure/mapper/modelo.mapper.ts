import { ModeloModel } from "../../data/models/modelo.model";
import { Modelo } from "../../domain/entities/modelo.entity";
import { IMapper } from "./mapper.abstract";

export class ModeloMapper extends IMapper<Modelo> {
    public toDomain(model: any): Modelo {
        return new Modelo(
            model.id ?? null, 
            model.name
        )
    }
    public toModel(entity: Modelo) {
        const model = new ModeloModel()
        model.id = entity.id
        model.name = entity.nombre
        return model
    }
}