import { Router } from "express";
import { LoginController } from "./controller";
import { authMiddleware } from "../../middleware/auth.middleware";

export class LoginRoutes {
    constructor() {
    }
    static get routes(): Router {
        const router = Router();
        const controller = new LoginController()
        
        /**
         * @swagger
         * /login:
         *   post:
         *     summary: "LEGACY - Iniciar sesión como médico"
         *     tags: [Autenticación]
         *     description: Ruta legacy mantenida para compatibilidad. Usar /medico/auth/login en su lugar.
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/LoginRequest'
         *     responses:
         *       200:
         *         description: Login exitoso
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/LoginResponse'
         *       401:
         *         description: Credenciales inválidas
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         */
        router.post('/', controller.login);
        
        /**
         * @swagger
         * /login/me:
         *   get:
         *     summary: "LEGACY - Obtener información del médico autenticado"
         *     tags: [Autenticación]
         *     description: Ruta legacy mantenida para compatibilidad. Usar /medico/auth/me en su lugar.
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: Información del médico
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Medico'
         *       401:
         *         description: No autorizado
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         */
        router.get('/me', authMiddleware, controller.me)
        
        router.put('/me', authMiddleware, controller.update)
        return router;
    }
}