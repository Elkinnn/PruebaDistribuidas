require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());


// targets
const ADMIN = process.env.ADMIN_SERVICE_URL || 'http://localhost:3001';
const MEDICO = process.env.MEDICO_SERVICE_URL || 'http://localhost:3100';

// Configuración de base de datos MySQL
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'hospitalservice'
};

// Función para conectar a la base de datos
async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

// Ruta específica para login - usando axios en lugar de proxy
app.post('/auth/login', async (req, res) => {
  try {
    console.log(`[LOGIN] Proxying to: ${ADMIN}/auth/login`);
    const response = await axios.post(`${ADMIN}/auth/login`, req.body, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      },
      timeout: 30000
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[LOGIN ERROR]', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        error: 'CONNECTION_ERROR', 
        message: 'Error de conexión con el servicio backend' 
      });
    }
  }
});

// Helper para pasar headers de autorización
function passAuthHeaders(proxyReq, req, res) {
  if (req.headers.authorization) {
    proxyReq.setHeader('authorization', req.headers.authorization);
    console.log('[AUTH] Passing authorization header');
  }
}

// Proxy para hospitales usando axios directo
app.use('/hospitales', async (req, res) => {
  try {
    console.log(`[HOSPITALES] ${req.method} ${req.url} -> ${ADMIN}/hospitales${req.url}`);
    
    const config = {
      method: req.method,
      url: `${ADMIN}/hospitales${req.url}`,
      headers: {
        ...req.headers
      },
      timeout: 30000
    };
    
    // Solo agregar data si hay body
    if (req.body && Object.keys(req.body).length > 0) {
      config.data = req.body;
    }
    
    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    // No es error si es 304 (Not Modified)
    if (error.response?.status === 304) {
      res.status(304).end();
      return;
    }
    
    console.error('[HOSPITALES ERROR]', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        error: 'PROXY_ERROR', 
        message: 'Error de conexión con el servicio de hospitales' 
      });
    }
  }
});

// Proxy para especialidades usando axios directo
app.use('/especialidades', async (req, res) => {
  try {
    console.log(`[ESPECIALIDADES] ${req.method} ${req.url} -> ${ADMIN}/especialidades${req.url}`);
    
    const config = {
      method: req.method,
      url: `${ADMIN}/especialidades${req.url}`,
      headers: {
        ...req.headers
      },
      timeout: 30000
    };
    
    // Solo agregar data si hay body
    if (req.body && Object.keys(req.body).length > 0) {
      config.data = req.body;
    }
    
    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[ESPECIALIDADES ERROR]', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        error: 'PROXY_ERROR', 
        message: 'Error de conexión con el servicio de especialidades' 
      });
    }
  }
});

// Proxy para médicos usando axios directo
app.use('/medicos', async (req, res) => {
  try {
    console.log(`[MEDICOS] ${req.method} ${req.url} -> ${ADMIN}/medicos${req.url}`);
    
    
    const config = {
      method: req.method,
      url: `${ADMIN}/medicos${req.url}`,
      headers: {
        ...req.headers
      },
      timeout: 30000
    };
    
    // Solo agregar data si hay body
    if (req.body && Object.keys(req.body).length > 0) {
      config.data = req.body;
    }
    
    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[MEDICOS ERROR]', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        error: 'PROXY_ERROR', 
        message: 'Error de conexión con el servicio de médicos' 
      });
    }
  }
});

// Proxy para empleados usando axios directo
app.use('/empleados', async (req, res) => {
  try {
    console.log(`[EMPLEADOS] ${req.method} ${req.url} -> ${ADMIN}/empleados${req.url}`);
    
    const config = {
      method: req.method,
      url: `${ADMIN}/empleados${req.url}`,
      headers: {
        ...req.headers
      },
      timeout: 30000
    };
    
    // Solo agregar data si hay body
    if (req.body && Object.keys(req.body).length > 0) {
      config.data = req.body;
    }
    
    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    // No es error si es 304 (Not Modified)
    if (error.response?.status === 304) {
      res.status(304).end();
      return;
    }
    
    console.error('[EMPLEADOS ERROR]', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        error: 'PROXY_ERROR', 
        message: 'Error de conexión con el servicio de empleados' 
      });
    }
  }
});

// Proxy para citas usando axios directo
app.use('/citas', async (req, res) => {
  try {
    const config = {
      method: req.method,
      url: `${ADMIN}/citas${req.url}`,
      headers: {
        ...req.headers
      },
      timeout: 30000,
      responseType: 'arraybuffer' // Importante para PDFs
    };
    
    // Solo agregar data si hay body
    if (req.body && Object.keys(req.body).length > 0) {
      config.data = req.body;
    }
    
    const response = await axios(config);
    
    // Verificar si es un PDF (rutas de reportes)
    if (req.url.includes('/reportes/')) {
      // Para PDFs, copiar headers y enviar como buffer
      Object.keys(response.headers).forEach(key => {
        if (key.toLowerCase() !== 'content-encoding') {
          res.setHeader(key, response.headers[key]);
        }
      });
      res.status(response.status).send(response.data);
    } else {
      // Para JSON, convertir a JSON
      const jsonData = JSON.parse(response.data.toString());
      res.status(response.status).json(jsonData);
    }
  } catch (error) {
    console.error('[CITAS ERROR]', error.message);
    if (error.response) {
      // Si es un PDF y hay error, intentar parsear como JSON
      if (req.url.includes('/reportes/')) {
        try {
          const jsonData = JSON.parse(error.response.data.toString());
          res.status(error.response.status).json(jsonData);
        } catch {
          res.status(error.response.status).send(error.response.data);
        }
      } else {
        res.status(error.response.status).json(error.response.data);
      }
    } else {
      res.status(500).json({ 
        error: 'PROXY_ERROR', 
        message: 'Error de conexión con el servicio de citas' 
      });
    }
  }
});

// Login de médico directo usando la base de datos
app.post('/medico/auth/login', async (req, res) => {
  try {
    console.log(`[MEDICO LOGIN] Direct database login`);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }
    
    const connection = await getConnection();
    
    // Buscar usuario médico
    const [users] = await connection.execute(
      'SELECT * FROM usuario WHERE email = ? AND rol = "MEDICO" AND activo = 1',
      [email]
    );
    
    if (users.length === 0) {
      await connection.end();
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const user = users[0];
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      await connection.end();
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Obtener información del médico si existe
    let medicoInfo = null;
    if (user.medicoId) {
      const [medicos] = await connection.execute(
        'SELECT * FROM medico WHERE id = ?',
        [user.medicoId]
      );
      if (medicos.length > 0) {
        medicoInfo = medicos[0];
      }
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        rol: user.rol, 
        medicoId: user.medicoId 
      },
      'secretKey123',
      { expiresIn: '24h' } // Aumentado a 24 horas
    );
    
    // Respuesta
    const response = {
      token,
      user: {
        id: user.id,
        email: user.email,
        rol: user.rol,
        medicoId: user.medicoId,
        nombre: medicoInfo?.nombres || "Dr. Usuario",
        apellidos: medicoInfo?.apellidos || "",
        especialidades: [] // Se puede implementar después
      }
    };
    
    await connection.end();
    res.status(200).json(response);
    
  } catch (error) {
    console.error('[MEDICO LOGIN ERROR]', error.message);
    res.status(500).json({ 
      error: 'LOGIN_ERROR', 
      message: 'Error interno en el login de médico' 
    });
  }
});

// Endpoint /me para perfil de médico
app.get('/medico/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }
    
    const decoded = jwt.verify(token, 'secretKey123');
    const connection = await getConnection();
    
    // Obtener información del usuario
    const [users] = await connection.execute(
      'SELECT * FROM usuario WHERE id = ?',
      [decoded.id]
    );
    
    if (users.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const user = users[0];
    
    // Obtener información del médico si existe
    let medicoInfo = null;
    if (user.medicoId) {
      const [medicos] = await connection.execute(
        'SELECT * FROM medico WHERE id = ?',
        [user.medicoId]
      );
      if (medicos.length > 0) {
        medicoInfo = medicos[0];
      }
    }
    
    const response = {
      id: user.id,
      email: user.email,
      rol: user.rol,
      medicoId: user.medicoId,
      nombre: medicoInfo?.nombres || "Dr. Usuario",
      apellidos: medicoInfo?.apellidos || "",
      especialidades: [], // Se puede implementar después
      hospital: "Hospital Central", // Se puede obtener de la BD después
      telefono: "",
      direccion: "",
      fechaIngreso: "Fecha de ingreso",
      diasTrabajo: ["Lun", "Mar", "Mié", "Jue", "Vie"],
      horario: "08:00 - 17:00"
    };
    
    await connection.end();
    res.json(response);
    
  } catch (error) {
    console.error('[MEDICO AUTH ERROR]', error.message);
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Token inválido' });
    } else {
      res.status(500).json({ 
        error: 'AUTH_ERROR', 
        message: 'Error interno en autenticación' 
      });
    }
  }
});

// Endpoint PUT /me para actualizar perfil de médico
app.put('/medico/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }
    
    const decoded = jwt.verify(token, 'secretKey123');
    const connection = await getConnection();
    
    // Por ahora solo devolvemos los datos actualizados
    // Se puede implementar actualización real después
    const response = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol,
      medicoId: decoded.medicoId,
      nombre: req.body.nombre || "Dr. Usuario",
      apellidos: req.body.apellidos || "",
      especialidades: req.body.especialidades || [],
      hospital: req.body.hospital || "Hospital Central",
      telefono: req.body.telefono || "",
      direccion: req.body.direccion || "",
      fechaIngreso: req.body.fechaIngreso || "Fecha de ingreso",
      diasTrabajo: req.body.diasTrabajo || ["Lun", "Mar", "Mié", "Jue", "Vie"],
      horario: req.body.horario || "08:00 - 17:00"
    };
    
    await connection.end();
    res.json(response);
    
  } catch (error) {
    console.error('[MEDICO AUTH UPDATE ERROR]', error.message);
    res.status(500).json({ 
      error: 'UPDATE_ERROR', 
      message: 'Error interno al actualizar perfil' 
    });
  }
});

// Endpoint temporal para citas de médico
app.get('/medico/citas', async (req, res) => {
  try {
    // Datos temporales para evitar errores 404
    const citas = [
      {
        id: 1,
        paciente: "Juan Pérez",
        fecha: "2024-01-15",
        hora: "09:00",
        estado: "PROGRAMADA",
        especialidad: "Medicina General"
      },
      {
        id: 2,
        paciente: "María García",
        fecha: "2024-01-15",
        hora: "10:30",
        estado: "PROGRAMADA",
        especialidad: "Medicina General"
      }
    ];
    
    res.json(citas);
  } catch (error) {
    console.error('[MEDICO CITAS ERROR]', error.message);
    res.status(500).json({ 
      error: 'CITAS_ERROR', 
      message: 'Error interno al obtener citas' 
    });
  }
});

// Endpoint temporal para citas de hoy
app.get('/medico/citas/hoy', async (req, res) => {
  try {
    // Datos temporales para evitar errores 404
    const citasHoy = [
      {
        id: 1,
        paciente: "Ana López",
        hora: "09:00",
        estado: "PROGRAMADA",
        especialidad: "Medicina General"
      },
      {
        id: 2,
        paciente: "Carlos Ruiz",
        hora: "11:00",
        estado: "PROGRAMADA",
        especialidad: "Medicina General"
      }
    ];
    
    res.json(citasHoy);
  } catch (error) {
    console.error('[MEDICO CITAS HOY ERROR]', error.message);
    res.status(500).json({ 
      error: 'CITAS_HOY_ERROR', 
      message: 'Error interno al obtener citas de hoy' 
    });
  }
});

// Endpoint temporal para estadísticas del dashboard
app.get('/medico/dashboard/stats', async (req, res) => {
  try {
    // Datos temporales para evitar errores 404
    const stats = {
      totalPacientes: 25,
      citasHoy: 8,
      consultasMes: 120,
      especialidades: ["Medicina General"]
    };
    
    res.json(stats);
  } catch (error) {
    console.error('[MEDICO DASHBOARD STATS ERROR]', error.message);
    res.status(500).json({ 
      error: 'STATS_ERROR', 
      message: 'Error interno al obtener estadísticas' 
    });
  }
});


// health del gateway
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    adminService: ADMIN,
    medicoService: MEDICO
  });
});

// 404 del gateway
app.use((_req, res) => res.status(404).json({ error: 'NOT_FOUND_GATEWAY' }));

// arranque
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway escuchando en :${PORT}`);
  console.log(`→ ADMIN_SERVICE_URL: ${ADMIN}`);
  console.log(`→ MEDICO_SERVICE_URL: ${MEDICO}`);
});