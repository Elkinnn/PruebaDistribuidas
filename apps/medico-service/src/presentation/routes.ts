import { Router } from "express";
import { LoginRoutes } from "./routes/login/routes";
import { CitaRoutes } from "./routes/citas/routes";

export class AppRoutes {
    constructor() { }

    static get routes(): Router {
        const router = Router();
        // Definir todos mis rutas principales
        router.get('/', (req, res) => {
            res.send({
                message: "Hola Papus"
            })
        });

        // router.use('/color', ColorRoutes.routes)
        // router.use('/marca', MarcaRoutes.routes)
        // router.use('/modelo', ModeloRoutes.routes)
        // router.use('/vehiculo', VehiculoRoutes.routes)
        router.use('/login', LoginRoutes.routes)
        router.use('/citas', CitaRoutes.routes)
        return router;
    }
}