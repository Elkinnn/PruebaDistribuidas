import { IDatabase } from "../../data/database.datasource"

export class GlobalDatabase {
    public readonly database : IDatabase
    private static instance : GlobalDatabase
    private constructor(database : IDatabase){
        this.database = database
    }

    public static getInstance(database? : IDatabase) {
        if (!this.instance) {
            if (!database) {
                throw new Error("Base no inicializada")
            }
            this.instance = new GlobalDatabase(database)
        }
        return this.instance
    }
}