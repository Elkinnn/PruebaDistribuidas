export abstract class IDatabase {
    public abstract connect(): Promise<boolean>;
}