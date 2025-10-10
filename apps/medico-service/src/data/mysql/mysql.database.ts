import { DataSource } from "typeorm";
import { IDatabase } from "../database.datasource";

interface Options {
    host: string,
    database: string,
    port: number,
    username: string,
    password: string,
    entities: Function[]
}

export class MySQLDatabase extends IDatabase {
    public dataSource?: DataSource
    private host: string
    private database: string
    private port: number
    private username: string
    private password: string
    private entities: Function[]

    constructor(options: Options) {
        super()
        const { database, password, port, username, entities, host } = options
        this.host = host
        this.database = database
        this.port = port
        this.password = password
        this.username = username
        this.entities = entities
    }

    public async connect(): Promise<boolean> {
        try {
            this.dataSource = new DataSource({
                type: 'mysql',
                host: this.host,
                database: this.database,
                port: this.port,
                username: this.username,
                password: this.password,
                entities: this.entities,
                synchronize: false, // No sincronizar automáticamente
                logging: false, // Deshabilitar logs para evitar spam
            })
            await this.dataSource.initialize()
            return true
        } catch (error) {
            console.log('Error de conexion')
            throw error
        }
    }

}