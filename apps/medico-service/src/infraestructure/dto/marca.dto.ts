type Result<T> = { error: string } | { value: T }

export class MarcaDto {
    private constructor(public nombre: string) { }
    static create(object: { [key: string]: any }): Result<MarcaDto> {
        if (!object.nombre) return { error: 'Falta nombre' }
        return { value: new MarcaDto(object.nombre) }
    }
}
