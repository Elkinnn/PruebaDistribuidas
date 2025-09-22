import { IDatabaseRepository } from "../../data/repository.datasource";
import { IMapper } from "../../infraestructure/mapper/mapper.abstract";

export class EntityRepository<Entity> {
    constructor(
        private readonly datasource: IDatabaseRepository<any>,
        private readonly mapper: IMapper<Entity>
    ) {
    }
    public async findAll(relations?: string[]): Promise<Entity[]> {
        const models = await this.datasource.findAll(relations)
        return models.map(this.mapper.toDomain)
    }
    public async findById(id: number, relations?: string[]): Promise<Entity | null> {
        const model = await this.datasource.findById(id, relations)
        return model ? this.mapper.toDomain(model) : null
    }
    public async create(created: Entity): Promise<boolean | Error> {
        const entity = this.mapper.toModel(created)
        const [result, error] = await this.datasource.create(entity)
        return error ?? result
    }
    public async update(updated: Entity): Promise<boolean | Error> {
        const entity = this.mapper.toModel(updated)
        const [result, error] = await this.datasource.update(entity)
        return error ?? result
    }
    public async delete(deleted: Entity): Promise<boolean | Error> {
        const entity = this.mapper.toModel(deleted)
        const [result, error] = await this.datasource.delete(entity)
        return error ?? result
    }
}