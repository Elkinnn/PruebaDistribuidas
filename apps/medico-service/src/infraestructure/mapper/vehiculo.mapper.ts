import { VehiculoModel } from "../../data/models/vehiculo.model";
import { Vehiculo } from "../../domain/entities/vehiculo.entity";
import { ColorMapper } from "./color.mapper";
import { IMapper } from "./mapper.abstract";
import { MarcaMapper } from "./marca.mapper";
import { ModeloMapper } from "./modelo.mapper";

export class VehiculoMapper extends IMapper<Vehiculo> {
    constructor() {
        super();
    }
    public toDomain(model: any): Vehiculo {
        return new Vehiculo(
            model.id ?? null,
            model.placa,
            model.chasis,
            model.anio,
            new MarcaMapper().toDomain(model.marca),
            new ModeloMapper().toDomain(model.modelo),
            new ColorMapper().toDomain(model.color),
        )
    }
    public toModel(entity: Vehiculo) {
        const model = new VehiculoModel()
        model.id = entity.id
        model.anio = entity.anio
        model.chasis = entity.chasis
        model.placa = entity.placa
        model.color = new ColorMapper().toModel(entity.color)
        model.marca = new MarcaMapper().toModel(entity.marca)
        model.modelo = new ModeloMapper().toModel(entity.modelo)
        return model
    }
}