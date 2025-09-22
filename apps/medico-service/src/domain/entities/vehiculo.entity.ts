import { Color } from "./color.entity";
import { Marca } from "./marca.entity";
import { Modelo } from "./modelo.entity";

export class Vehiculo {
    constructor(
        public id: number,
        public placa: string,
        public chasis: string,
        public anio: number,
        public marca: Marca,
        public modelo: Modelo,
        public color: Color,
    ) {

    }
}