type Result<T> = { error: string } | { value: T }

export class ColorDto {
    private constructor(public nombre: string) { }
    static create(object: { [key: string]: any }): Result<ColorDto> {
        if (!object.nombre) return { error: 'Falta nombre' }
        return { value: new ColorDto(object.nombre) }
    }
}
