import { ColorDto } from "./color.dto";
import { MarcaDto } from "./marca.dto";
import { ModeloDto } from "./modelo.dto";

export class VehiculoDto {
    private constructor(
        public placa: string,
        public chasis: string,
        public anio: number,
        public marca: MarcaDto,
        public modelo: ModeloDto,
        public color: ColorDto
    ) {
    }

    static create(object: any) {
        const { placa, chasis, anio, marca, modelo, color } = object
        if (!placa) return ['Falta placa'];
        if (!chasis) return ['Falta chasis'];
        if (!anio) return ['Falta anio'];
        if (!marca) return ['Falta marca'];
        if (!modelo) return ['Falta modelo'];
        if (!color) return ['Falta color'];
        const marcaResult = MarcaDto.create(marca)
        if ('error' in marcaResult) return [marcaResult.error]

        const modeloResult = ModeloDto.create(modelo)
        if ('error' in modeloResult) return [modeloResult.error]

        const colorResult = ColorDto.create(color)
        if ('error' in colorResult) return [colorResult.error]

        return [
            undefined,
            new VehiculoDto(
                placa,
                chasis,
                anio,
                marcaResult.value,
                modeloResult.value,
                colorResult.value
            )
        ]

    }
}