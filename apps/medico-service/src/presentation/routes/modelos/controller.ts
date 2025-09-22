import { Request, Response } from "express";
import ModeloUseCases from "../../../domain/use-cases/modelos";

export class ModeloController {
    constructor(
    ) {
    }
    getAll = async (req: Request, res: Response) => {
        try {
            const usecase = new ModeloUseCases.CargaModelos()
            const models = await usecase.cargaModelos()
            res.json(models);
        } catch (error) {
            console.error("Error al obtener los modelos:", error);
            res.status(500).json({ error: "Error al obtener los modelos" });
        }
    }
}