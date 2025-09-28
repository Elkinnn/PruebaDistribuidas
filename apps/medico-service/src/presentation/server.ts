import express, { Router } from 'express';
import { setupSwagger } from '../swagger';

interface Options {
    port?: number;
    routes: Router;
}
export class Server {
    public readonly app = express()
    private readonly port: number;
    private readonly routes: Router;
    constructor(options: Options) {
        const { port = 3100, routes } = options;
        this.port = port;
        this.routes = routes;
    }
    async start() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // Configurar Swagger
        setupSwagger(this.app);
        
        // Endpoint de salud
        this.app.get('/health', (req, res) => {
            res.json({ 
                ok: true, 
                service: 'medico-service',
                timestamp: new Date().toISOString()
            });
        });
        
        this.app.use(this.routes);
        this.app.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
            console.log(`Swagger documentation available at http://localhost:${this.port}/api-docs`);
        })
    }
}
