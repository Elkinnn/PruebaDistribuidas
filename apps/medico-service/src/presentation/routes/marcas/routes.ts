import { Router } from "express";
import { MarcaController } from "./controller";

export class MarcaRoutes {
    constructor() {
    }
    static get routes(): Router {
        const router = Router();
        const controller = new MarcaController()
        // Definir todos mis rutas principales
        router.get('/', controller.getAll);
        return router;
    }
}