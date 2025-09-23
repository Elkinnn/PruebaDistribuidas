import { DatasourceFactory } from "../../../infraestructure/datasource/datasource.factory";
import { GlobalDatabase } from "../../../infraestructure/datasource/datasource.global";
import { EntityRepository } from "../../repository/repository.entity";
import { CustomError } from "../../errors/error.entity";
import { Cita } from "../../entities/cita.entity";
import { CitaMapper } from "../../../infraestructure/mapper/cita.mapper";
import { CitaModel } from "../../../data/models/cita.model";

export class CRUDCitas {
    private readonly repository: EntityRepository<Cita>

    constructor() {
        const database = GlobalDatabase.getInstance().database
        const datasource = DatasourceFactory.generateRepository(database, CitaModel)
        if (!datasource) {
            throw new CustomError(400, "Repositorio no implementado", null)
        }
        const mapper = new CitaMapper()
        this.repository = new EntityRepository<Cita>(datasource, mapper)
    }
    public getAll(): Promise<Cita[]> {
        try {
            const result = this.repository.findAll([])
            return result
        } catch (error) {
            throw new CustomError(400, "Error al cargar los Citas", error)
        }
    }

    public get(id: number): Promise<Cita | null> {
        try {
            const result = this.repository.findById(id)
            return result
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

    // public async update(id: number, data: Partial<Cita>): Promise<boolean> {
    //     try {
    //         const toUpdate = await this.repository.findById(id, ['marca', 'modelo', 'color'])
    //         if (!toUpdate) {
    //             throw new CustomError(404, "Cita no encontrado", "No encontrado")
    //         }
    //         toUpdate.placa = data.placa ?? toUpdate.placa;
    //         toUpdate.chasis = data.chasis ?? toUpdate.chasis;
    //         toUpdate.anio = data.anio ?? toUpdate.anio;
    //         toUpdate.marca = data.marca ?? toUpdate.marca;
    //         toUpdate.modelo = data.modelo ?? toUpdate.modelo;
    //         toUpdate.color = data.color ?? toUpdate.color;
    //         const result = await this.repository.update(toUpdate)
    //         if (result instanceof Error) {
    //             throw result
    //         }
    //         return result
    //     } catch (error) {
    //         throw error
    //     }
    // }

    public async delete(id: number): Promise<boolean> {
        try {
            const deleted = await this.repository.findById(id, ['marca', 'modelo', 'color'])
            if (!deleted) {
                throw new CustomError(404, "Cita no encontrado", "No encontrado")
            }
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