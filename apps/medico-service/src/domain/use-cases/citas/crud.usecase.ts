import { DatasourceFactory } from "../../../infraestructure/datasource/datasource.factory";
import { GlobalDatabase } from "../../../infraestructure/datasource/datasource.global";
import { EntityRepository } from "../../repository/repository.entity";
import { CustomError } from "../../errors/error.entity";
import { Cita } from "../../entities/cita.entity";
import { CitaMapper } from "../../../infraestructure/mapper/cita.mapper";
import { CitaModel } from "../../../data/models/cita.model";
import { Medico } from "../../entities/medico.entity";

export class CRUDCitas {
    private readonly repository: EntityRepository<Cita>

    constructor(
        private readonly medico: Medico
    ) {
        const database = GlobalDatabase.getInstance().database
        const datasource = DatasourceFactory.generateRepository(database, CitaModel)
        if (!datasource) {
            throw new CustomError(400, "Repositorio no implementado", null)
        }
        const mapper = new CitaMapper()
        this.repository = new EntityRepository<Cita>(datasource, mapper)
    }
    public async getAll(): Promise<Cita[]> {
        try {
            const result = await this.repository.findBy({ medico: this.medico })
            return result ?? []
        } catch (error) {
            throw new CustomError(400, "Error al cargar los Citas", error)
        }
    }

    public async get(id: number): Promise<Cita | null> {
        try {
            const result = await this.repository.findBy({
                id: id,
                medico: this.medico
            })
            if (!result || result.length != 1) throw new CustomError(400, "Cita invalida", "Cita no encontrada")
            return result[0]
        } catch (error) {
            throw new CustomError(400, "No encontrado", "Cita no encontrado")
        }
    }

    public async create(created: any): Promise<boolean> {
        try {
            const result = await this.repository.create(created)
            console.log(result)
            if (result instanceof Error) {
                throw result
            }
            return result
        } catch (error) {
            throw error
        }
    }

    public async update(id: number, data: Partial<Cita>): Promise<boolean> {
        try {
            const query = await this.repository.findBy({
                id: id,
                medico: this.medico
            });
            if (!query || query.length != 1) {
                throw new CustomError(404, "Cita no encontrada", "No encontrada");
            }
            const toUpdate = query[0]
            if (toUpdate.estado != "PROGRAMADA") {
                throw new CustomError(404, "Cita NO ACTUALIZABLE", "No se puede actualizar una cita que no esta PROGRAMADA");
            }
            toUpdate.motivo = data.motivo ?? toUpdate.motivo;
            toUpdate.estado = data.estado ?? toUpdate.estado;
            toUpdate.fechaFin = data.fechaFin ?? toUpdate.fechaFin;
            toUpdate.actualizadaPor = this.medico.usuario;
            toUpdate.updatedAt = new Date();
            const result = await this.repository.update(toUpdate);
            if (result instanceof Error) {
                throw result;
            }
            return result;
        } catch (error) {
            throw error;
        }
    }


    public async delete(id: number): Promise<boolean> {
        try {
            const deletables = await this.repository.findBy({
                id: id,
                medico: this.medico
            })
            if (!deletables || deletables.length != 1) {
                throw new CustomError(404, "Cita no encontrado", "No encontrado")
            }
            const deleted = deletables[0]
            const result = await this.repository.delete(deleted)
            if (result instanceof Error) {
                throw result
            }
            return result
        } catch (error) {
            throw error
        }
    }
}