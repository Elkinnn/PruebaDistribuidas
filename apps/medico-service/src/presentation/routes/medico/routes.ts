import { Router } from "express";
import { MedicoController } from "./controller";
import { authMiddleware } from "../../middleware/auth.middleware";

export class MedicoRoutes {
    constructor() {
    }
    static get routes(): Router {
        const router = Router();
        const controller = new MedicoController()
        
        /**
         * @swagger
         * /medico/auth/login:
         *   post:
         *     summary: Iniciar sesión como médico
         *     tags: [Autenticación]
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
        router.post('/auth/login', controller.login);
        
        /**
         * @swagger
         * /medico/auth/me:
         *   get:
         *     summary: Obtener información del médico autenticado
         *     tags: [Autenticación]
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
        router.get('/auth/me', authMiddleware, controller.me);
        
        /**
         * @swagger
         * /medico/auth/me:
         *   put:
         *     summary: Actualizar información del médico autenticado
         *     tags: [Autenticación]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               nombres:
         *                 type: string
         *               apellidos:
         *                 type: string
         *               email:
         *                 type: string
         *                 format: email
         *               password:
         *                 type: string
         *     responses:
         *       200:
         *         description: Información actualizada
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
        router.put('/auth/me', authMiddleware, controller.updateMe);
        
        /**
         * @swagger
         * /medico/citas:
         *   get:
         *     summary: Obtener todas las citas del médico
         *     tags: [Citas]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: query
         *         name: estado
         *         schema:
         *           type: string
         *           enum: [PENDIENTE, CONFIRMADA, ATENDIDA, CANCELADA]
         *         description: Filtrar por estado de la cita
         *       - in: query
         *         name: fecha
         *         schema:
         *           type: string
         *           format: date
         *         description: Filtrar por fecha específica
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
        router.get('/citas', authMiddleware, controller.getCitas);
        
        /**
         * @swagger
         * /medico/citas/hoy:
         *   get:
         *     summary: Obtener citas del día actual
         *     tags: [Citas]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: Citas de hoy
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
        router.get('/citas/hoy', authMiddleware, controller.getCitasHoy);
        
        /**
         * @swagger
         * /medico/citas:
         *   post:
         *     summary: Crear nueva cita
         *     tags: [Citas]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required: [pacienteId, fechaInicio, fechaFin, motivo]
         *             properties:
         *               pacienteId:
         *                 type: integer
         *               fechaInicio:
         *                 type: string
         *                 format: date-time
         *               fechaFin:
         *                 type: string
         *                 format: date-time
         *               motivo:
         *                 type: string
         *               notas:
         *                 type: string
         *     responses:
         *       201:
         *         description: Cita creada exitosamente
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
         */
        router.post('/citas', authMiddleware, controller.createCita);
        
        /**
         * @swagger
         * /medico/citas/{id}:
         *   put:
         *     summary: Actualizar una cita
         *     tags: [Citas]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *         description: ID de la cita
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/UpdateCitaRequest'
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
        router.put('/citas/:id', authMiddleware, controller.updateCita);
        
        /**
         * @swagger
         * /medico/citas/{id}:
         *   delete:
         *     summary: Eliminar una cita
         *     tags: [Citas]
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
         *         description: Cita eliminada exitosamente
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 success:
         *                   type: boolean
         *                   example: true
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
        router.delete('/citas/:id', authMiddleware, controller.deleteCita);
        
        /**
         * @swagger
         * /medico/especialidades:
         *   get:
         *     summary: Obtener especialidades del médico autenticado
         *     tags: [Información del Médico]
         *     security:
         *       - bearerAuth: []
         *     description: Devuelve solo las especialidades asignadas al médico que inició sesión
         *     responses:
         *       200:
         *         description: Lista de especialidades del médico autenticado
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 data:
         *                   type: array
         *                   items:
         *                     $ref: '#/components/schemas/Especialidad'
         *       401:
         *         description: No autorizado
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         */
        router.get('/especialidades', authMiddleware, controller.getEspecialidades);
        
        /**
         * @swagger
         * /medico/perfil:
         *   get:
         *     summary: Obtener perfil completo del médico
         *     tags: [Información del Médico]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: Perfil del médico
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
        router.get('/perfil', authMiddleware, controller.getPerfil);
        
        /**
         * @swagger
         * /medico/perfil:
         *   put:
         *     summary: Actualizar perfil del médico
         *     tags: [Información del Médico]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               nombres:
         *                 type: string
         *               apellidos:
         *                 type: string
         *               email:
         *                 type: string
         *                 format: email
         *     responses:
         *       200:
         *         description: Perfil actualizado
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
        router.put('/perfil', authMiddleware, controller.updateProfile);
        
        /**
         * @swagger
         * /medico/info:
         *   get:
         *     summary: Obtener información básica del médico
         *     tags: [Información del Médico]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: Información básica del médico
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 id:
         *                   type: integer
         *                 nombres:
         *                   type: string
         *                 apellidos:
         *                   type: string
         *                 hospital:
         *                   type: string
         *                 especialidades:
         *                   type: array
         *                   items:
         *                     type: string
         *       401:
         *         description: No autorizado
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         */
        router.get('/info', authMiddleware, controller.getInfo);
        
        /**
         * @swagger
         * /medico/stats:
         *   get:
         *     summary: Obtener estadísticas del médico
         *     tags: [Estadísticas]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: Estadísticas del médico
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/MedicoStats'
         *       401:
         *         description: No autorizado
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         */
        router.get('/stats', authMiddleware, controller.getStats);
        
        /**
         * @swagger
         * /medico/dashboard/stats:
         *   get:
         *     summary: Obtener estadísticas para el dashboard del médico
         *     tags: [Estadísticas]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: Estadísticas del dashboard
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/MedicoStats'
         *       401:
         *         description: No autorizado
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Error'
         */
        router.get('/dashboard/stats', authMiddleware, controller.getDashboardStats);
        
        return router;
    }
}
