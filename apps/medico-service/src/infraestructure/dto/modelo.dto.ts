type Result<T> = { error: string } | { value: T }

export class ModeloDto {
    private constructor(
        public nombre: string
    ) { }
    static create(object: { [key: string]: any }): Result<ModeloDto> {
        if (!object.nombre) return { error: 'Falta nombre' }
        return { value: new ModeloDto(object.nombre) }
    }
}
