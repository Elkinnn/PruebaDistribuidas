import { DataSource } from "typeorm";
import { IDatabase } from "../database.datasource";
import * as fs from 'fs';

interface Options {
    host: string,
    database: string,
    port: number,
    username: string,
    password: string,
    entities: Function[],
    ssl: boolean
}

export class MySQLDatabase extends IDatabase {
    public dataSource?: DataSource
    private host: string
    private database: string
    private port: number
    private username: string
    private password: string
    private entities: Function[]
    private readonly useSSL: boolean

    constructor(options: Options) {
        super()
        const { database, password, port, username, entities, host, ssl } = options
        this.host = host
        this.database = database
        this.port = port
        this.password = password
        this.username = username
        this.entities = entities
        this.useSSL = ssl
    }

    public async connect(): Promise<boolean> {
        try {
            const sslConfig = this.useSSL
                ? {
                    rejectUnauthorized: true,
                    ...(process.env.DB_SSL_CA_PATH ? { ca: fs.readFileSync(process.env.DB_SSL_CA_PATH, 'utf8') } : {})
                }
                : undefined;

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
                ssl: sslConfig,
            })
            await this.dataSource.initialize()
            return true
        } catch (error) {
            console.log('Error de conexion')
            throw error
        }
    }

    public async disconnect(): Promise<void> {
        if (this.dataSource?.isInitialized) {
            await this.dataSource.destroy()
        }
    }

}