import { Router } from "express";
import { CitaController } from "./controller";
import { authMiddleware } from "../../middleware/auth.middleware";

export class CitaRoutes {
    constructor() {
    }
    static get routes(): Router {
        const router = Router();
        const controller = new CitaController()
        
        /**
         * @swagger
         * /citas:
         *   get:
         *     summary: "LEGACY - Obtener todas las citas del médico"
         *     tags: [Citas]
         *     description: Ruta legacy mantenida para compatibilidad. Usar /medico/citas en su lugar.
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: Lista de citas
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 data:
         *                   type: array
         *                   items:
         *                     $ref: '#/components/schemas/Cita'
         *       401:
         *         description: No autorizado
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         */
        router.use(authMiddleware)
        router.get('/', controller.getAll)
        
        /**
         * @swagger
         * /citas/{id}:
         *   get:
         *     summary: "LEGACY - Obtener una cita específica"
         *     tags: [Citas]
         *     description: Ruta legacy mantenida para compatibilidad. Usar /medico/citas/{id} en su lugar.
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *         description: ID de la cita
         *     responses:
         *       200:
         *         description: Cita encontrada
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Cita'
         *       401:
         *         description: No autorizado
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         *       404:
         *         description: Cita no encontrada
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         */
        router.get('/:id', controller.getOne)
        
        /**
         * @swagger
         * /citas:
         *   put:
         *     summary: "LEGACY - Actualizar una cita"
         *     tags: [Citas]
         *     description: Ruta legacy mantenida para compatibilidad. Usar /medico/citas/{id} en su lugar.
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required: [id]
         *             properties:
         *               id:
         *                 type: integer
         *                 description: ID de la cita a actualizar
         *               estado:
         *                 type: string
         *                 enum: [PENDIENTE, CONFIRMADA, ATENDIDA, CANCELADA]
         *               fechaFin:
         *                 type: string
         *                 format: date-time
         *               notas:
         *                 type: string
         *     responses:
         *       200:
         *         description: Cita actualizada exitosamente
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Cita'
         *       400:
         *         description: Datos inválidos
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         *       401:
         *         description: No autorizado
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         *       404:
         *         description: Cita no encontrada
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         */
        router.put('/', controller.update)
        return router;
    }
}