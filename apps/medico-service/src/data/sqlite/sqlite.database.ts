import { DataSource } from "typeorm";
import { IDatabase } from "../database.datasource";

interface Options {
    database: string,
    entities: Function[]
}

export class SQLiteDatabase extends IDatabase {
    public dataSource?: DataSource
    private database: string
    private entities: Function[]

    constructor(options: Options) {
        super()
        const { database, entities } = options
        this.database = database
        this.entities = entities
    }

    public async connect(): Promise<boolean> {
        try {
            this.dataSource = new DataSource({
                type: 'sqlite',
                database: this.database,
                entities: this.entities,
                synchronize: true, //dev
                logging: true, //dev
            })
            await this.dataSource.initialize()
            return true
        } catch (error) {
            console.log('Error de conexion')
            throw error
        }
    }

}