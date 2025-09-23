import { DatasourceFactory } from "../../../infraestructure/datasource/datasource.factory";
import { GlobalDatabase } from "../../../infraestructure/datasource/datasource.global";
import { EntityRepository } from "../../repository/repository.entity";
import { CustomError } from "../../errors/error.entity";

export class CargaModelos {
    private readonly repository : EntityRepository<Modelo>

    constructor() {
        const database = GlobalDatabase.getInstance().database
        const datasource = DatasourceFactory.generateRepository(database, ModeloModel)
        if (!datasource) {
            throw new Error("Repositorio no implementado")
        }
        const mapper = new ModeloMapper()
        this.repository = new EntityRepository<Modelo>(datasource, mapper)
    }
    public cargaModelos() : Promise<Modelo[]>{
        try {
            const result = this.repository.findAll()
            return result
        } catch (error) {
            throw new CustomError(404, "Error al cargar los modelos", error)            
        }
    }
}