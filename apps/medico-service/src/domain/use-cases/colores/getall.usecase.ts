import { ColorModel } from "../../../data/models/color.model";
import { DatasourceFactory } from "../../../infraestructure/datasource/datasource.factory";
import { GlobalDatabase } from "../../../infraestructure/datasource/datasource.global";
import { Color } from "../../entities/color.entity";
import { ColorMapper } from "../../../infraestructure/mapper/color.mapper";
import { EntityRepository } from "../../repository/repository.entity";
import { CustomError } from "../../errors/error.entity";

export class CargaColores {
    private readonly repository : EntityRepository<Color>

    constructor() {
        const database = GlobalDatabase.getInstance().database
        const datasource = DatasourceFactory.generateRepository(database, ColorModel)
        if (!datasource) {
            throw new Error("Repositorio no implementado")
        }
        const mapper = new ColorMapper()
        this.repository = new EntityRepository<Color>(datasource, mapper)
    }
    public cargaColores() : Promise<Color[]>{
        try {
            const result = this.repository.findAll()
            return result
        } catch (error) {
            throw new CustomError(404, "Error al cargar los colores", error)            
        }
    }
}