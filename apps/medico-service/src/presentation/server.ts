import express, { Router } from 'express';
import { Server as HttpServer } from 'http';
import { DataSource } from 'typeorm';
import { setupSwagger } from '../swagger';

interface Options {
    port?: number;
    routes: Router;
    dataSource?: DataSource;
}
export class Server {
    public readonly app = express()
    private readonly port: number;
    private readonly routes: Router;
    private readonly dataSource?: DataSource;
    private httpServer?: HttpServer;
    constructor(options: Options) {
        const { port = 3100, routes, dataSource } = options;
        this.port = port;
        this.routes = routes;
        this.dataSource = dataSource;
    }
    async start(): Promise<HttpServer> {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // Configurar Swagger
        setupSwagger(this.app);
        
        // Endpoint de salud
        this.app.get('/health', (req, res) => {
            res.json({ 
                ok: true, 
                service: 'medico-service',
                ts: new Date().toISOString()
            });
        });

        // Endpoint de readiness
        this.app.get('/ready', async (_req, res) => {
            try {
                if (!this.dataSource || !this.dataSource.isInitialized) {
                    throw new Error('DataSource not initialized');
                }

                await this.dataSource.query('SELECT 1');
                res.json({ ok: true, db: 'ready' });
            } catch (error) {
                res.status(503).json({
                    ok: false,
                    db: 'unavailable',
                    error: (error as Error).message,
                });
            }
        });
        
        this.app.use(this.routes);
        const PORT = Number(process.env.PORT ?? this.port ?? 3000);
        this.httpServer = this.app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
        });

        return this.httpServer;
    }

    async stop(): Promise<void> {
        if (!this.httpServer) {
            return;
        }

        await new Promise<void>((resolve, reject) => {
            this.httpServer?.close((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
}
