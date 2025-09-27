import { Router } from "express";
import { MedicoController } from "./controller";
import { authMiddleware } from "../../middleware/auth.middleware";

export class MedicoRoutes {
    constructor() {
    }
    static get routes(): Router {
        const router = Router();
        const controller = new MedicoController()
        
        // Rutas de autenticación de médico
        router.post('/auth/login', controller.login);
        router.get('/auth/me', authMiddleware, controller.me);
        router.put('/auth/me', authMiddleware, controller.updateMe);
        
        // Rutas de gestión de citas
        router.get('/citas', authMiddleware, controller.getCitas);
        router.get('/citas/hoy', authMiddleware, controller.getCitasHoy);
        router.post('/citas', authMiddleware, controller.createCita);
        router.put('/citas/:id', authMiddleware, controller.updateCita);
        router.delete('/citas/:id', authMiddleware, controller.deleteCita);
        
        // Rutas de información del médico
        router.get('/especialidades', authMiddleware, controller.getEspecialidades);
        router.get('/perfil', authMiddleware, controller.getPerfil);
        router.put('/perfil', authMiddleware, controller.updatePerfil);
        router.get('/info', authMiddleware, controller.getInfo);
        router.get('/stats', authMiddleware, controller.getStats);
        router.get('/dashboard/stats', authMiddleware, controller.getDashboardStats);
        
        return router;
    }
}
