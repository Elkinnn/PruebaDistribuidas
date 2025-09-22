import { Router } from "express";
import { ModeloController } from "./controller";

export class ModeloRoutes {
    constructor() {
    }
    static get routes(): Router {
        const router = Router();
        const controller = new ModeloController()
        // Definir todos mis rutas principales
        router.get('/', controller.getAll);
        return router;
    }
}