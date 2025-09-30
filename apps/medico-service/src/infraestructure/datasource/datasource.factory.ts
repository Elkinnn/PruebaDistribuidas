import { ObjectType } from "typeorm";
import { ObjectLiteral } from "typeorm";
import { IDatabase } from "../../data/database.datasource";
import { MySQLDatabase } from "../../data/mysql/mysql.database";
import { MySQLRepository } from "../../data/repositories/mysql.repository";
import { SQLiteRepository } from "../../data/repositories/sqlite.repository";
import { IDatabaseRepository } from "../../data/repository.datasource";
import { SQLiteDatabase } from "../../data/sqlite/sqlite.database";

export class DatasourceFactory {
    public static generateRepository<T extends ObjectLiteral>(
        database: IDatabase,
        model: ObjectType<T>
    ): IDatabaseRepository<T> | null {
        if (database instanceof MySQLDatabase) {
            return new MySQLRepository<T>(model, database);
        }
        if (database instanceof SQLiteDatabase) {
            return new SQLiteRepository<T>(model, database);
        }
        return null;
    }
}