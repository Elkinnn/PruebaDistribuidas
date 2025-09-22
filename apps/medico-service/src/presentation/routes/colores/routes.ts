import { Router } from "express";
import { ColorController } from "./controller";

export class ColorRoutes {
    constructor() {
    }
    static get routes(): Router {
        const router = Router();
        const controller = new ColorController()
        // Definir todos mis rutas principales
        router.get('/', controller.getAll);
        return router;
    }
}