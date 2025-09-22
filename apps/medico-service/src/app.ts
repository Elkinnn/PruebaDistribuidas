import { envs } from "./config/envs"
import Models from "./data/models"
import { MySQLDatabase } from "./data/mysql/mysql.database"
import { GlobalDatabase } from "./infraestructure/datasource/datasource.global"
import { AppRoutes } from "./presentation/routes"
import { Server } from "./presentation/server"


(() => {
    main()
})()

async function main() {
    const database = new MySQLDatabase({
        database: envs.MYSQL_DB,
        password: envs.MYSQL_PASSWORD ?? '',
        port: envs.MYSQL_PORT,
        username: envs.MYSQL_USER,
        entities: Models
    })
    await GlobalDatabase.getInstance(database).database.connect()
    const server = new Server({
        port: envs.PORT,
        routes: AppRoutes.routes
    })
    await server.start()
}