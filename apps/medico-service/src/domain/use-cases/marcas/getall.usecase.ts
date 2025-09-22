import { DatasourceFactory } from "../../../infraestructure/datasource/datasource.factory";
import { GlobalDatabase } from "../../../infraestructure/datasource/datasource.global";
import { EntityRepository } from "../../repository/repository.entity";
import { CustomError } from "../../errors/error.entity";
import { Marca } from "../../entities/marca.entity";
import { MarcaModel } from "../../../data/models/marca.model";
import { MarcaMapper } from "../../../infraestructure/mapper/marca.mapper";

export class CargaMarcas {
    private readonly repository : EntityRepository<Marca>

    constructor() {
        const database = GlobalDatabase.getInstance().database
        const datasource = DatasourceFactory.generateRepository(database, MarcaModel)
        if (!datasource) {
            throw new Error("Repositorio no implementado")
        }
        const mapper = new MarcaMapper()
        this.repository = new EntityRepository<Marca>(datasource, mapper)
    }
    public cargaMarcas() : Promise<Marca[]>{
        try {
            const result = this.repository.findAll()
            return result
        } catch (error) {
            throw new CustomError(404, "Error al cargar las marcas", error)            
        }
    }
}