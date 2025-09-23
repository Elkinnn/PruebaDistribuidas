import { Router } from "express";
import { LoginController } from "./controller";

export class LoginRoutes {
    constructor() {
    }
    static get routes(): Router {
        const router = Router();
        const controller = new LoginController()
        // Definir todos mis rutas principales
        router.post('/', controller.login);
        return router;
    }
}