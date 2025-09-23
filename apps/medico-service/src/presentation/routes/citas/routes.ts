import { Router } from "express";
import { CitaController } from "./controller";
import { authMiddleware } from "../../middleware/auth.middleware";

export class CitaRoutes {
    constructor() {
    }
    static get routes(): Router {
        const router = Router();
        const controller = new CitaController()
        // Definir todos mis rutas principales
        router.use(authMiddleware)
        router.get('/', controller.getAll)
        router.get('/:id', controller.getOne)
        return router;
    }
}