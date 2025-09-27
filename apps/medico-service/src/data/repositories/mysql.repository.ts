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
        return this.datasource.find({ 
            relations,
            order: {
                id: 'DESC' as any // Ordenar por ID descendente para mostrar las más recientes primero
            }
        })
    }

    public findById(id: number, relations?: string[]): Promise<T | null> {
        return this.datasource.findOne({
            where: {
                id: id as any
            },
            relations: relations
        })
    }
    public findBy(where: Partial<T>, relations?: string[]): Promise<T[] | null> {
        return this.datasource.find({
            where: where,
            relations: relations,
            order: {
                id: 'DESC' as any // Ordenar por ID descendente para mostrar las más recientes primero
            }
        })
    }
    public async create(created: T): Promise<[T, CustomError?]> {
        try {
            console.log('[MYSQL REPOSITORY] Intentando crear entidad:', created);
            const savedEntity = await this.datasource.save(created);
            console.log('[MYSQL REPOSITORY] Entidad creada exitosamente:', savedEntity);
            return [savedEntity]
        } catch (error) {
            console.error('[MYSQL REPOSITORY] Error al crear:', error);
            return [created, new CustomError(400, "Error al crear", error)]
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
            console.log(`[MYSQL REPOSITORY DELETE] Eliminando entidad:`, deleted);
            
            // Intentar eliminar por ID si la entidad tiene un campo id
            if (deleted && typeof deleted === 'object' && 'id' in deleted) {
                console.log(`[MYSQL REPOSITORY DELETE] Eliminando por ID: ${deleted.id}`);
                const result = await this.datasource.delete({ id: deleted.id } as any);
                console.log(`[MYSQL REPOSITORY DELETE] Resultado eliminación por ID:`, result);
                
                if (result.affected && result.affected > 0) {
                    console.log(`[MYSQL REPOSITORY DELETE] ✅ Eliminación exitosa`);
                    return [true];
                } else {
                    console.log(`[MYSQL REPOSITORY DELETE] ❌ No se eliminó ninguna fila`);
                    return [false, new CustomError(400, "No se pudo eliminar la entidad", "No se encontró la entidad o no se pudo eliminar")]
                }
            } else {
                // Fallback al método original
                console.log(`[MYSQL REPOSITORY DELETE] Usando método original`);
                const flag = !!await this.datasource.delete(deleted);
                return [flag]
            }
        } catch (error) {
            console.error(`[MYSQL REPOSITORY DELETE ERROR]`, error);
            return [false, new CustomError(400, "Error al borrar", error)]
        }
    }
}