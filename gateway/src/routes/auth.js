const express = require('express');
const config = require('../config');
const { requestWithRetry } = require('../http');
const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autenticar usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *                 example: "admin@hospital.com"
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Ruta específica para login - usando axios para lógica extra si es necesaria
router.post('/login', async (req, res) => {
  try {
    console.log(`[AUTH] Login request to: ${config.services.admin}/auth/login`);
    const forwardHeaders = {
      'Content-Type': 'application/json',
      ...req.headers,
    };

    delete forwardHeaders['content-length'];
    delete forwardHeaders['Content-Length'];
    delete forwardHeaders['host'];
    delete forwardHeaders['Host'];

    const requestConfig = {
      method: 'POST',
      url: `${config.services.admin}/auth/login`,
      headers: forwardHeaders,
      data: req.body,
      __serviceName: 'admin-service'
    };

    const response = await requestWithRetry(requestConfig);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[AUTH ERROR]', error.message);
    if (error.isCircuitOpen && error.response) {
      console.error('[AUTH ERROR] Circuit Breaker abierto');
      res.status(error.response.status).json(error.response.data);
    } else if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error: 'CONNECTION_ERROR',
        message: 'Error de conexión con el servicio de autenticación'
      });
    }
  }
});

module.exports = router;