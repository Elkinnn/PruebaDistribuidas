import { MarcaModel } from "../../data/models/marca.model";
import { Marca } from "../../domain/entities/marca.entity";
import { IMapper } from "./mapper.abstract";

export class MarcaMapper extends IMapper<Marca> {
    public toDomain(model: any): Marca {
        return new Marca(
            model.id ?? null, 
            model.name
        )
    }
    public toModel(entity: Marca) {
        const model = new MarcaModel()
        model.id = entity.id
        model.name = entity.nombre
        return model
    }
}