import { Request, Response } from "express";
import MarcaUseCases from "../../../domain/use-cases/marcas";

export class MarcaController {
    constructor(
    ) {
    }
    getAll = async (req: Request, res: Response) => {
        try {
            const usecase = new MarcaUseCases.CargaMarcas()
            const models = await usecase.cargaMarcas()
            res.json(models);
        } catch (error) {
            console.error("Error al obtener las marcas:", error);
            res.status(500).json({ error: "Error al obtener las marcas" });
        }
    }
}