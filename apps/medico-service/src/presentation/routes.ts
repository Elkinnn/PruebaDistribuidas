import { Router } from "express";
import { LoginRoutes } from "./routes/login/routes";
import { CitaRoutes } from "./routes/citas/routes";
import { MedicoRoutes } from "./routes/medico/routes";

export class AppRoutes {
    constructor() { }

    static get routes(): Router {
        const router = Router();
        // Definir todos mis rutas principales
        router.get('/', (req, res) => {
            res.send({
                message: "Medico Service - Sistema de Gestión Médica"
            })
        });

        // Rutas de autenticación y gestión de médicos
        router.use('/medico', MedicoRoutes.routes);
        
        // Rutas legacy (mantener para compatibilidad)
        router.use('/login', LoginRoutes.routes)
        router.use('/citas', CitaRoutes.routes)
        return router;
    }
}