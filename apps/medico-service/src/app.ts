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
        database: envs.MYSQL_DB,
        entities: Models,
        password: envs.MYSQL_PASSWORD ?? "",
        port: envs.MYSQL_PORT,
        username: envs.MYSQL_USER
    })
    await GlobalDatabase.getInstance(database).database.connect()
    const server = new Server({
        port: envs.PORT,
        routes: AppRoutes.routes
    })
    await server.start()
}