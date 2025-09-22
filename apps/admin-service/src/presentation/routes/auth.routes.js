const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { sign } = require('../../infrastructure/auth/jwt');
const users = require('../../infrastructure/persistence/usuario.repo');

const router = Router();

/* POST /auth/login  { email, password } */
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  
  // Validaciones básicas
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'VALIDATION_ERROR', 
      message: 'email y password son requeridos' 
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

    // Solo permitir login de administradores
    if (user.rol !== 'ADMIN_GLOBAL') {
      return res.status(401).json({ 
        error: 'UNAUTHORIZED', 
        message: 'Acceso denegado. Solo administradores pueden acceder' 
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

    // Generar token
    const tokenPayload = { 
      id: user.id, 
      email: user.email, 
      rol: user.rol
    };

    const token = sign(tokenPayload);
    
    // Respuesta
    const response = {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        rol: user.rol
      },
      message: 'Login exitoso como administrador'
    };

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
