import { EntityTarget, ObjectLiteral, Repository } from "typeorm";
import { IDatabaseRepository } from "../repository.datasource";
import { MySQLDatabase } from "../mysql/mysql.database";
import { CustomError } from "../../domain/errors/error.entity";

export class MySQLRepository<T extends ObjectLiteral> extends IDatabaseRepository<T> {
    private readonly datasource: Repository<T>
    constructor(
        entity: EntityTarget<T>,
        private readonly database: MySQLDatabase,
    ) {
        super()
        if (!database.dataSource) {
            throw new Error("Base no inicializadas")
        }
        this.datasource = database.dataSource.getRepository(entity)
    }

    public findAll(relations?: string[]): Promise<T[]> {
        return this.datasource.find({ relations })
    }

    public findById(id: number, relations?: string[]): Promise<T | null> {
        return this.datasource.findOne({
            where: {
                id: id as any
            },
            relations: relations
        })
    }

    public async create(created: T): Promise<[boolean, CustomError?]> {
        try {
            const flag = !!await this.datasource.save(created);
            return [flag]
        } catch (error) {
            console.log()
            return [false, new CustomError(400, "Error al crear", error)]
        }
    }

    public async update(updated: T): Promise<[boolean, CustomError?]> {
        try {
            const flag = !!await this.datasource.save(updated);
            return [flag]
        } catch (error) {
            return [false, new CustomError(400, "Error al actualizar", error)]
        }
    }

    public async delete(deleted: T): Promise<[boolean, CustomError?]> {
        try {
            const flag = !!await this.datasource.delete(deleted);
            return [flag]
        } catch (error) {
            return [false, new CustomError(400, "Error al borrar", error)]
        }
    }
}