// Cargar dotenv como el servicio de admin
require('dotenv').config();
import { envs } from "./config/envs"
import Models from "./data/models"
import { MySQLDatabase } from "./data/mysql/mysql.database"
import { SQLiteDatabase } from "./data/sqlite/sqlite.database"
import { GlobalDatabase } from "./infraestructure/datasource/datasource.global"
import { AppRoutes } from "./presentation/routes"
import { Server } from "./presentation/server"


(() => {
    main()
})()

async function main() {
    // Usar MySQL como el servicio de admin
    const database = new MySQLDatabase({
        host: envs.MYSQL_HOST,
        database: envs.MYSQL_DB,
        entities: Models,
        password: envs.MYSQL_PASSWORD ?? "",
        port: envs.MYSQL_PORT,
        username: envs.MYSQL_USER,
        ssl: envs.MYSQL_SSL,
    })

    const globalDatabase = GlobalDatabase.getInstance(database).database
    await globalDatabase.connect()

    const server = new Server({
        port: envs.PORT,
        routes: AppRoutes.routes,
        dataSource: database.dataSource,
    })

    await server.start()

    const shutdown = async (signal: NodeJS.Signals) => {
        console.log(`[medico-service] Recibida señal ${signal}. Iniciando apagado controlado...`)
        try {
            await server.stop()
        } catch (error) {
            console.error('[medico-service] Error al detener el servidor:', error)
        }

        try {
            await globalDatabase.disconnect()
        } catch (error) {
            console.error('[medico-service] Error al desconectar la base de datos:', error)
        }

        process.exit(0)
    }

    ;['SIGTERM', 'SIGINT'].forEach((signal) => {
        process.on(signal, () => {
            void shutdown(signal as NodeJS.Signals)
        })
    })
}