import { ColorModel } from "../../data/models/color.model";
import { Color } from "../../domain/entities/color.entity";
import { IMapper } from "./mapper.abstract";

export class ColorMapper extends IMapper<Color> {
    public toDomain(model: any): Color {
        return new Color(
            model.id ?? null, 
            model.name
        )
    }
    public toModel(entity: Color) {
        const model = new ColorModel()
        model.id = entity.id
        model.name = entity.nombre
        return model
    }
}