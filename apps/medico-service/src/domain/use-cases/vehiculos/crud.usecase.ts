import { DatasourceFactory } from "../../../infraestructure/datasource/datasource.factory";
import { GlobalDatabase } from "../../../infraestructure/datasource/datasource.global";
import { EntityRepository } from "../../repository/repository.entity";
import { CustomError } from "../../errors/error.entity";
import { Vehiculo } from "../../entities/vehiculo.entity";
import { VehiculoMapper } from "../../../infraestructure/mapper/vehiculo.mapper";
import { VehiculoModel } from "../../../data/models/vehiculo.model";

export class CRUD {
    private readonly repository: EntityRepository<Vehiculo>

    constructor() {
        const database = GlobalDatabase.getInstance().database
        const datasource = DatasourceFactory.generateRepository(database, VehiculoModel)
        if (!datasource) {
            throw new CustomError(400, "Repositorio no implementado", null)
        }
        const mapper = new VehiculoMapper()
        this.repository = new EntityRepository<Vehiculo>(datasource, mapper)
    }
    public getAll(): Promise<Vehiculo[]> {
        try {
            const result = this.repository.findAll(['marca', 'modelo', 'color'])
            return result
        } catch (error) {
            throw new CustomError(400, "Error al cargar los vehiculos", error)
        }
    }

    public get(id: number): Promise<Vehiculo | null> {
        try {
            const result = this.repository.findById(id, ['marca', 'modelo', 'color'])
            return result
        } catch (error) {
            throw new CustomError(400, "No encontrado", "Vehiculo no encontrado")
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

    public async update(id: number, data: Partial<Vehiculo>): Promise<boolean> {
        try {
            const toUpdate = await this.repository.findById(id, ['marca', 'modelo', 'color'])
            if (!toUpdate) {
                throw new CustomError(404, "Vehiculo no encontrado", "No encontrado")
            }
            toUpdate.placa = data.placa ?? toUpdate.placa;
            toUpdate.chasis = data.chasis ?? toUpdate.chasis;
            toUpdate.anio = data.anio ?? toUpdate.anio;
            toUpdate.marca = data.marca ?? toUpdate.marca;
            toUpdate.modelo = data.modelo ?? toUpdate.modelo;
            toUpdate.color = data.color ?? toUpdate.color;
            const result = await this.repository.update(toUpdate)
            if (result instanceof Error) {
                throw result
            }
            return result
        } catch (error) {
            throw error
        }
    }

    public async delete(id: number): Promise<boolean> {
        try {
            const deleted = await this.repository.findById(id, ['marca', 'modelo', 'color'])
            if (!deleted) {
                throw new CustomError(404, "Vehiculo no encontrado", "No encontrado")
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