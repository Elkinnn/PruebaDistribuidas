import { Router } from "express";
import { VehiculoController } from "./controller";

export class VehiculoRoutes {
    constructor() {
    }
    static get routes(): Router {
        const router = Router();
        const controller = new VehiculoController()
        // Definir todos mis rutas principales
        router.post('/', controller.create)
        router.delete('/:id', controller.delete)
        router.patch('/:id', controller.update)
        router.get('/', controller.getAll);
        router.get('/:id', controller.getOne)
        return router;
    }
}