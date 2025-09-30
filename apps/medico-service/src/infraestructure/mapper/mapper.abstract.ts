export abstract class IMapper<Entity> {
    public abstract toDomain(model: any): Entity;
    public abstract toModel(entity: Entity): any;
}
