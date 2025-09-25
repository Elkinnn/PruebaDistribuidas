import { Router } from "express";
import { LoginController } from "./controller";
import { authMiddleware } from "../../middleware/auth.middleware";

export class LoginRoutes {
    constructor() {
    }
    static get routes(): Router {
        const router = Router();
        const controller = new LoginController()
        // Definir todos mis rutas principales
        router.post('/', controller.login);
        router.get('/me', authMiddleware, controller.me)
        router.put('/me', authMiddleware, controller.update)
        return router;
    }
}