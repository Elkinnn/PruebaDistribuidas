const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { sign } = require('../../infrastructure/auth/jwt');
const users = require('../../infrastructure/persistence/usuario.repo');

const router = Router();

/* POST /auth/login  { email, password, tipo } */
router.post('/auth/login', async (req, res) => {
  const { email, password, tipo } = req.body || {};
  
  // Validaciones básicas
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'VALIDATION_ERROR', 
      message: 'email y password son requeridos' 
    });
  }

  if (!tipo || !['admin', 'medico'].includes(tipo)) {
    return res.status(400).json({ 
      error: 'VALIDATION_ERROR', 
      message: 'tipo debe ser "admin" o "medico"' 
    });
  }

  try {
    // Buscar usuario por email
    const user = await users.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        error: 'UNAUTHORIZED', 
        message: 'Credenciales inválidas' 
      });
    }

    // Verificar que el tipo de usuario coincida
    const expectedRole = tipo === 'admin' ? 'ADMIN_GLOBAL' : 'MEDICO';
    if (user.rol !== expectedRole) {
      return res.status(401).json({ 
        error: 'UNAUTHORIZED', 
        message: `Acceso denegado. Este login es para ${tipo}s` 
      });
    }

    // Verificar contraseña
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ 
        error: 'UNAUTHORIZED', 
        message: 'Credenciales inválidas' 
      });
    }

    // Generar token con información específica del tipo
    const tokenPayload = { 
      id: user.id, 
      email: user.email, 
      rol: user.rol,
      tipo: tipo
    };

    const token = sign(tokenPayload);
    
    // Respuesta específica según el tipo
    const response = {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        rol: user.rol,
        tipo: tipo
      },
      message: `Login exitoso como ${tipo}`
    };

    // Si es médico, incluir información adicional del médico
    if (tipo === 'medico' && user.medicoId) {
      // Aquí podrías agregar información del médico si la necesitas
      response.user.medicoId = user.medicoId;
    }

    res.json(response);

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'INTERNAL_ERROR', 
      message: 'Error interno del servidor' 
    });
  }
});

/* POST /auth/validate-token - Validar token existente */
router.post('/auth/validate-token', async (req, res) => {
  const { token } = req.body || {};
  
  if (!token) {
    return res.status(400).json({ 
      error: 'VALIDATION_ERROR', 
      message: 'Token es requerido' 
    });
  }

  try {
    const { verify } = require('../../infrastructure/auth/jwt');
    const decoded = verify(token);
    
    res.json({
      success: true,
      valid: true,
      user: decoded
    });
  } catch (error) {
    res.status(401).json({ 
      success: false,
      valid: false,
      error: 'UNAUTHORIZED', 
      message: 'Token inválido o expirado' 
    });
  }
});

module.exports = router;
