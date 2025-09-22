import { Request, Response } from "express";
import ColorUseCases from "../../../domain/use-cases/colores";

export class ColorController {
    constructor(
    ) {
    }
    getAll = async (req: Request, res: Response) => {
        try {
            const usecase = new ColorUseCases.CargaColores()
            const models = await usecase.cargaColores()
            res.json(models);
        } catch (error) {
            console.error("Error al obtener los colores:", error);
            res.status(500).json({ error: "Error al obtener los colores" });
        }
    }
}