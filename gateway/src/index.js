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

// Función para verificar si el servicio de médico está corriendo
async function checkMedicoService() {
  try {
    const response = await axios.get(`${MEDICO}/health`, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.log('[MEDICO SERVICE] No disponible:', error.message);
    return false;
  }
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
    // Verificar si el servicio de médico está corriendo
    const isMedicoServiceRunning = await checkMedicoService();
    if (!isMedicoServiceRunning) {
      return res.status(503).json({ 
        error: 'SERVICE_UNAVAILABLE', 
        message: 'El servicio de médico no está disponible. Por favor, inicie el servicio de médico en el puerto 3100.' 
      });
    }
    
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
    // Verificar si el servicio de médico está corriendo
    const isMedicoServiceRunning = await checkMedicoService();
    if (!isMedicoServiceRunning) {
      return res.status(503).json({ 
        error: 'SERVICE_UNAVAILABLE', 
        message: 'El servicio de médico no está disponible. Por favor, inicie el servicio de médico en el puerto 3100.' 
      });
    }
    
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, 'secretKey123');
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }
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

// Endpoint para obtener citas del médico autenticado
app.get('/medico/citas', async (req, res) => {
  try {
    // Verificar si el servicio de médico está corriendo
    const isMedicoServiceRunning = await checkMedicoService();
    if (!isMedicoServiceRunning) {
      return res.status(503).json({ 
        error: 'SERVICE_UNAVAILABLE', 
        message: 'El servicio de médico no está disponible. Por favor, inicie el servicio de médico en el puerto 3100.' 
      });
    }
    
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, 'secretKey123');
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    
    // Conectar a la base de datos para obtener citas reales
    const connection = await getConnection();
    
    try {
      console.log('[MEDICO CITAS] Consultando citas reales para médico:', decoded.medicoId);
      
      // Obtener parámetros de consulta
      const { page = 1, pageSize = 8, q = '' } = req.query;
      const offset = (page - 1) * pageSize;
      
      // Construir consulta con filtros
      let whereClause = 'WHERE c.medicoId = ?';
      let params = [decoded.medicoId];
      
      if (q) {
        whereClause += ' AND (c.pacienteNombre LIKE ? OR c.motivo LIKE ? OR c.estado LIKE ?)';
        const searchTerm = `%${q}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Contar total de citas
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total 
        FROM Cita c 
        ${whereClause}
      `, params);
      
      const total = countResult[0].total;

      // Obtener citas paginadas con datos del paciente
      const [citasResult] = await connection.execute(`
        SELECT 
          c.id,
          c.fechaInicio,
          c.fechaFin,
          c.motivo,
          c.estado,
          c.pacienteId,
          c.pacienteNombre,
          c.pacienteTelefono,
          c.pacienteEmail,
          p.documento as paciente_documento,
          p.fechaNacimiento as paciente_fechaNacimiento,
          p.sexo as paciente_sexo,
          h.nombre as hospital_nombre,
          c.createdAt,
          c.updatedAt
        FROM Cita c
        LEFT JOIN Hospital h ON c.hospitalId = h.id
        LEFT JOIN Paciente p ON c.pacienteId = p.id
        ${whereClause}
        ORDER BY c.fechaInicio DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(pageSize), offset]);

      await connection.end();

      console.log('[MEDICO CITAS] Citas reales encontradas:', citasResult.length);

      // Formatear datos para el frontend
      const citas = citasResult.map(cita => {
        // Manejar fechaInicio correctamente
        let fecha = null;
        let hora = null;
        
        if (cita.fechaInicio) {
          const fechaStr = cita.fechaInicio.toString();
          if (fechaStr.includes('T')) {
            fecha = fechaStr.split('T')[0];
            hora = fechaStr.split('T')[1];
          } else {
            // Si es solo fecha, usar como está
            fecha = fechaStr;
            hora = '00:00:00';
          }
        }
        
        // Crear objeto de fecha/hora para inicio y fin
        const inicio = fecha && hora ? `${fecha}T${hora}` : cita.fechaInicio;
        const fin = cita.fechaFin || inicio;
        
        return {
          id: cita.id,
          inicio: inicio,
          fin: fin,
          estado: cita.estado,
          motivo: cita.motivo,
          observaciones: '', // Campo vacío ya que no existe en la BD
          paciente: {
            nombres: cita.pacienteNombre ? cita.pacienteNombre.split(' ')[0] : '',
            apellidos: cita.pacienteNombre ? cita.pacienteNombre.split(' ').slice(1).join(' ') : '',
            documento: cita.paciente_documento || '',
            telefono: cita.pacienteTelefono || '',
            email: cita.pacienteEmail || '',
            fechaNacimiento: cita.paciente_fechaNacimiento || '',
            sexo: cita.paciente_sexo || 'masculino'
          },
          hospital_nombre: cita.hospital_nombre || 'Hospital Central',
          createdAt: cita.createdAt,
          updatedAt: cita.updatedAt
        };
      });

      // Devolver estructura esperada por el frontend
      res.json({
        data: citas,
        total: total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / pageSize)
      });

    } catch (dbError) {
      await connection.end();
      console.error('[MEDICO CITAS DB ERROR]', dbError.message);
      
      // Si hay error en la base de datos, devolver estructura vacía
      res.json({
        data: [],
        total: 0,
        page: 1,
        pageSize: 8,
        totalPages: 0
      });
    }
    
  } catch (error) {
    console.error('[MEDICO CITAS ERROR]', error.message);
    res.status(500).json({
      error: 'CITAS_ERROR',
      message: 'Error interno al obtener citas'
    });
  }
});

// Endpoint para actualizar una cita
app.put('/medico/citas/:id', async (req, res) => {
  try {
    const isMedicoServiceRunning = await checkMedicoService();
    if (!isMedicoServiceRunning) {
      return res.status(503).json({
        error: 'SERVICE_UNAVAILABLE',
        message: 'El servicio de médico no está disponible. Por favor, inicie el servicio de médico en el puerto 3100.'
      });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, 'secretKey123');
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    const { id } = req.params;
    const { estado, inicio: nuevaFechaInicio, fin: nuevaFechaFin } = req.body;

    console.log('[UPDATE CITA] Actualizando cita:', { id, estado, inicio: nuevaFechaInicio, fin: nuevaFechaFin });

    // Validar datos requeridos
    if (!estado) {
      return res.status(400).json({ 
        message: 'El estado es requerido' 
      });
    }

    // Conectar a la base de datos
    const connection = await getConnection();
    
    try {
      // Verificar que la cita pertenece al médico autenticado
      const [citaCheck] = await connection.execute(
        'SELECT id, medicoId, fechaInicio, fechaFin FROM Cita WHERE id = ? AND medicoId = ?',
        [id, decoded.medicoId]
      );
      
      if (!citaCheck.length) {
        await connection.end();
        return res.status(404).json({
          error: 'CITA_NOT_FOUND',
          message: 'Cita no encontrada o no pertenece al médico'
        });
      }

      // Si se proporciona fecha de inicio o fin, validar solapamiento
      if (nuevaFechaInicio || nuevaFechaFin) {
        const fechaInicioActual = citaCheck[0].fechaInicio;
        const fechaFinActual = citaCheck[0].fechaFin;
        
        const fechaInicio = nuevaFechaInicio || fechaInicioActual;
        const fechaFin = nuevaFechaFin || fechaFinActual;
        
        const [overlapCheck] = await connection.execute(`
          SELECT id FROM Cita 
          WHERE medicoId = ? 
          AND id != ? 
          AND estado != 'CANCELADA'
          AND NOT (fechaFin <= ? OR fechaInicio >= ?)
        `, [decoded.medicoId, id, fechaInicio, fechaFin]);
        
        if (overlapCheck.length > 0) {
          await connection.end();
          return res.status(400).json({
            error: 'OVERLAP_CONFLICT',
            message: 'La nueva fecha se solapa con otra cita existente'
          });
        }
      }

      // Actualizar la cita
      const updateFields = ['estado = ?'];
      const updateValues = [estado];
      
      if (nuevaFechaInicio) {
        updateFields.push('fechaInicio = ?');
        updateValues.push(nuevaFechaInicio);
      }
      
      if (nuevaFechaFin) {
        updateFields.push('fechaFin = ?');
        updateValues.push(nuevaFechaFin);
      }

      const [updateResult] = await connection.execute(`
        UPDATE Cita 
        SET ${updateFields.join(', ')}, actualizadaPorId = ?, updatedAt = NOW()
        WHERE id = ?
      `, [...updateValues, decoded.id, id]);

      if (updateResult.affectedRows === 0) {
        await connection.end();
        return res.status(404).json({
          error: 'UPDATE_FAILED',
          message: 'No se pudo actualizar la cita'
        });
      }

      await connection.end();

      res.json({
        id: parseInt(id),
        message: 'Cita actualizada exitosamente'
      });

    } catch (dbError) {
      await connection.end();
      console.error('[UPDATE CITA DB ERROR]', dbError.message);
      res.status(500).json({
        error: 'UPDATE_CITA_ERROR',
        message: 'Error al actualizar en la base de datos: ' + dbError.message
      });
    }

  } catch (error) {
    console.error('[UPDATE CITA ERROR]', error.message);
    res.status(500).json({
      error: 'UPDATE_CITA_ERROR',
      message: 'Error interno al actualizar cita'
    });
  }
});

// Endpoint para eliminar una cita
app.delete('/medico/citas/:id', async (req, res) => {
  try {
    const isMedicoServiceRunning = await checkMedicoService();
    if (!isMedicoServiceRunning) {
      return res.status(503).json({
        error: 'SERVICE_UNAVAILABLE',
        message: 'El servicio de médico no está disponible. Por favor, inicie el servicio de médico en el puerto 3100.'
      });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, 'secretKey123');
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    const { id } = req.params;

    console.log('[DELETE CITA] Eliminando cita:', { id });

    // Conectar a la base de datos
    const connection = await getConnection();
    
    try {
      // Verificar que la cita pertenece al médico autenticado y obtener su estado
      const [citaCheck] = await connection.execute(
        'SELECT id, medicoId, estado FROM Cita WHERE id = ? AND medicoId = ?',
        [id, decoded.medicoId]
      );
      
      if (!citaCheck.length) {
        await connection.end();
        return res.status(404).json({
          error: 'CITA_NOT_FOUND',
          message: 'Cita no encontrada o no pertenece al médico'
        });
      }

      // Verificar que la cita puede ser eliminada (solo ATENDIDA o CANCELADA)
      const estado = citaCheck[0].estado;
      if (estado === 'PROGRAMADA') {
        await connection.end();
        return res.status(400).json({
          error: 'DELETE_NOT_ALLOWED',
          message: 'No puedes eliminar una cita en estado PROGRAMADA'
        });
      }

      // Eliminar la cita
      const [deleteResult] = await connection.execute(
        'DELETE FROM Cita WHERE id = ?',
        [id]
      );

      if (deleteResult.affectedRows === 0) {
        await connection.end();
        return res.status(404).json({
          error: 'DELETE_FAILED',
          message: 'No se pudo eliminar la cita'
        });
      }

      await connection.end();

      res.json({
        id: parseInt(id),
        message: 'Cita eliminada exitosamente'
      });

    } catch (dbError) {
      await connection.end();
      console.error('[DELETE CITA DB ERROR]', dbError.message);
      res.status(500).json({
        error: 'DELETE_CITA_ERROR',
        message: 'Error al eliminar en la base de datos: ' + dbError.message
      });
    }

  } catch (error) {
    console.error('[DELETE CITA ERROR]', error.message);
    res.status(500).json({
      error: 'DELETE_CITA_ERROR',
      message: 'Error interno al eliminar cita'
    });
  }
});

// Endpoint para obtener especialidades del hospital del médico
app.get('/medico/especialidades', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, 'secretKey123');
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    console.log('[MEDICO ESPECIALIDADES] Obteniendo especialidades para médico:', decoded.medicoId);

    // Conectar a la base de datos
    const connection = await getConnection();
    
    try {
      // Obtener el hospital del médico
      const [medicoResult] = await connection.execute(
        'SELECT hospitalId FROM Medico WHERE id = ?',
        [decoded.medicoId]
      );
      
      if (!medicoResult.length) {
        await connection.end();
        return res.status(404).json({
          error: 'MEDICO_NOT_FOUND',
          message: 'Médico no encontrado'
        });
      }

      const hospitalId = medicoResult[0].hospitalId;

      // Obtener especialidades del hospital con conteo de médicos
      const [especialidadesResult] = await connection.execute(`
        SELECT 
          e.id,
          e.nombre,
          e.descripcion,
          COUNT(me.medicoId) as medicos
        FROM Especialidad e
        LEFT JOIN MedicoEspecialidad me ON e.id = me.especialidadId
        LEFT JOIN Medico m ON me.medicoId = m.id AND m.hospitalId = ?
        GROUP BY e.id, e.nombre, e.descripcion
        ORDER BY e.nombre
      `, [hospitalId]);

      await connection.end();

      console.log('[MEDICO ESPECIALIDADES] Especialidades encontradas:', especialidadesResult.length);

      // Mapeo de iconos para especialidades
      const iconosMap = {
        'Cardiología': '❤️',
        'Cardiologia': '❤️',
        'Neurología': '🧠',
        'Neurologia': '🧠',
        'Oftalmología': '👁️',
        'Oftalmologia': '👁️',
        'Traumatología': '🦴',
        'Traumatologia': '🦴',
        'Pediatría': '👶',
        'Pediatria': '👶',
        'Medicina General': '🩺',
        'Dermatología': '🧴',
        'Dermatologia': '🧴',
        'Ginecología': '🌸',
        'Ginecologia': '🌸',
        'Psiquiatría': '🧠',
        'Psiquiatria': '🧠',
        'Urología': '🔬',
        'Urologia': '🔬',
        'Endocrinología': '⚕️',
        'Endocrinologia': '⚕️',
        'Gastroenterología': '🫀',
        'Gastroenterologia': '🫀',
        'Neumología': '🫁',
        'Neumologia': '🫁',
        'Oncología': '🎗️',
        'Oncologia': '🎗️',
        'Radiología': '📷',
        'Radiologia': '📷',
        'Anestesiología': '💉',
        'Anestesiologia': '💉',
        'Cirugía General': '🔪',
        'Cirugia General': '🔪',
        'Ortopedia': '🦴',
        'Otorrinolaringología': '👂',
        'Otorrinolaringologia': '👂',
        'Reumatología': '🦵',
        'Reumatologia': '🦵'
      };

      // Formatear especialidades con iconos
      const especialidades = especialidadesResult.map(esp => ({
        id: esp.id,
        nombre: esp.nombre,
        descripcion: esp.descripcion || 'Especialidad médica disponible en nuestro centro.',
        medicos: parseInt(esp.medicos) || 0,
        icono: iconosMap[esp.nombre] || '🏥',
        activa: true // Todas las especialidades se consideran activas
      }));

      // Calcular estadísticas
      const totalEspecialidades = especialidades.length;
      const totalMedicos = especialidades.reduce((sum, esp) => sum + esp.medicos, 0);
      const masPopular = especialidades.reduce((prev, current) =>
        prev.medicos > current.medicos ? prev : current
      );

      res.json({
        data: especialidades,
        total: totalEspecialidades,
        estadisticas: {
          totalEspecialidades,
          totalMedicos,
          masPopular: masPopular.nombre,
          medicosMasPopular: masPopular.medicos
        }
      });

    } catch (dbError) {
      await connection.end();
      console.error('[MEDICO ESPECIALIDADES DB ERROR]', dbError.message);
      res.status(500).json({
        error: 'ESPECIALIDADES_ERROR',
        message: 'Error al obtener especialidades: ' + dbError.message
      });
    }

  } catch (error) {
    console.error('[MEDICO ESPECIALIDADES ERROR]', error.message);
    res.status(500).json({
      error: 'ESPECIALIDADES_ERROR',
      message: 'Error interno al obtener especialidades'
    });
  }
});

// Endpoint para obtener perfil completo del médico
app.get('/medico/perfil', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, 'secretKey123');
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    console.log('[MEDICO PERFIL] Obteniendo perfil para médico:', decoded.medicoId);

    // Usar el endpoint existente de /medico/auth/me y obtener hospital real
    try {
      const response = await fetch('http://localhost:3000/medico/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener datos del médico');
      }
      
      const medicoData = await response.json();
      
      // Obtener hospital real y especialidades desde la base de datos
      const connection = await getConnection();
      const [hospitalResult] = await connection.execute(`
        SELECT h.nombre as hospital_nombre
        FROM Medico m
        LEFT JOIN Hospital h ON m.hospitalId = h.id
        WHERE m.id = ?
      `, [decoded.medicoId]);
      
      // Obtener especialidades del médico desde la base de datos
      const [especialidadesResult] = await connection.execute(`
        SELECT e.nombre
        FROM MedicoEspecialidad me
        LEFT JOIN Especialidad e ON me.especialidadId = e.id
        WHERE me.medicoId = ?
      `, [decoded.medicoId]);
      
      await connection.end();
      
      // Formatear datos para el frontend - Solo información esencial
      const perfil = {
        nombre: `${medicoData.nombre} ${medicoData.apellidos}`,
        especialidades: especialidadesResult.map(esp => esp.nombre),
        hospital: hospitalResult.length > 0 ? hospitalResult[0].hospital_nombre : medicoData.hospital || 'Hospital Central',
        email: medicoData.email,
        horario: medicoData.horario || '08:00 - 17:00',
        diasTrabajo: Array.isArray(medicoData.diasTrabajo) 
          ? medicoData.diasTrabajo 
          : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
      };

      console.log('[MEDICO PERFIL] Perfil obtenido:', perfil.nombre);

      res.json(perfil);

    } catch (fetchError) {
      console.error('[MEDICO PERFIL FETCH ERROR]', fetchError.message);
      res.status(500).json({
        error: 'PERFIL_ERROR',
        message: 'Error al obtener perfil: ' + fetchError.message
      });
    }

  } catch (error) {
    console.error('[MEDICO PERFIL ERROR]', error.message);
    res.status(500).json({
      error: 'PERFIL_ERROR',
      message: 'Error interno al obtener perfil'
    });
  }
});

// Endpoint para actualizar perfil del médico (solo horario)
app.put('/medico/perfil', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, 'secretKey123');
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    const { nombre, email } = req.body;

    console.log('[MEDICO PERFIL UPDATE] Actualizando perfil para médico:', decoded.medicoId);

    // Conectar a la base de datos
    const connection = await getConnection();
    
    try {
      // Actualizar nombre y email
      const updates = [];
      const values = [];
      
      if (nombre) {
        const [nombrePart, apellidoPart] = nombre.split(' ');
        updates.push('nombres = ?, apellidos = ?');
        values.push(nombrePart || '', apellidoPart || '');
      }
      
      if (email) {
        updates.push('email = ?');
        values.push(email);
      }
      
      if (updates.length > 0) {
        values.push(decoded.medicoId);
        await connection.execute(`
          UPDATE Medico 
          SET ${updates.join(', ')}
          WHERE id = ?
        `, values);
      }
      
      // Los días de trabajo solo se actualizan en el frontend (no en la base de datos)

      await connection.end();

      console.log('[MEDICO PERFIL UPDATE] Perfil actualizado exitosamente');

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente'
      });

    } catch (dbError) {
      await connection.end();
      console.error('[MEDICO PERFIL UPDATE DB ERROR]', dbError.message);
      res.status(500).json({
        error: 'UPDATE_ERROR',
        message: 'Error al actualizar perfil: ' + dbError.message
      });
    }

  } catch (error) {
    console.error('[MEDICO PERFIL UPDATE ERROR]', error.message);
    res.status(500).json({
      error: 'UPDATE_ERROR',
      message: 'Error interno al actualizar perfil'
    });
  }
});

// Endpoint para obtener información básica del médico
app.get('/medico/info', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, 'secretKey123');
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    console.log('[MEDICO INFO] Obteniendo información del médico:', decoded.medicoId);

    // Conectar a la base de datos
    const connection = await getConnection();
    
    try {
      // Obtener información básica del médico
      const [medicoResult] = await connection.execute(`
        SELECT 
          m.id,
          m.nombres,
          m.apellidos,
          m.email,
          h.nombre as hospital_nombre
        FROM Medico m 
        LEFT JOIN Hospital h ON m.hospitalId = h.id
        WHERE m.id = ?
      `, [decoded.medicoId]);

      // Obtener especialidades del médico
      const [especialidadesResult] = await connection.execute(`
        SELECT e.nombre 
        FROM MedicoEspecialidad me
        LEFT JOIN Especialidad e ON me.especialidadId = e.id
        WHERE me.medicoId = ?
        ORDER BY e.nombre ASC
      `, [decoded.medicoId]);

      await connection.end();

      if (medicoResult.length === 0) {
        return res.status(404).json({
          error: 'MEDICO_NOT_FOUND',
          message: 'Médico no encontrado'
        });
      }

      const medico = medicoResult[0];
      const especialidades = especialidadesResult.map(esp => esp.nombre);
      
      const info = {
        id: medico.id,
        nombre: `${medico.nombres} ${medico.apellidos}`.trim(),
        email: medico.email,
        hospital: medico.hospital_nombre || 'Hospital Central',
        especialidades: especialidades
      };

      console.log('[MEDICO INFO] Información obtenida:', info);

      res.json(info);

    } catch (dbError) {
      await connection.end();
      console.error('[MEDICO INFO DB ERROR]', dbError.message);
      res.status(500).json({
        error: 'MEDICO_INFO_ERROR',
        message: 'Error al obtener información del médico: ' + dbError.message
      });
    }
    
  } catch (error) {
    console.error('[MEDICO INFO ERROR]', error.message);
    res.status(500).json({ 
      error: 'MEDICO_INFO_ERROR', 
      message: 'Error interno del servidor: ' + error.message 
    });
  }
});

// Endpoint para obtener estadísticas del médico
app.get('/medico/stats', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, 'secretKey123');
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    console.log('[MEDICO STATS] Obteniendo estadísticas para médico:', decoded.medicoId);

    // Conectar a la base de datos
    const connection = await getConnection();
    
    try {
      // Obtener estadísticas del médico
      const [statsResult] = await connection.execute(`
        SELECT 
          (SELECT COUNT(DISTINCT c.pacienteId) 
           FROM Cita c 
           WHERE c.medicoId = ? AND c.estado != 'CANCELADA') as totalPacientes,
          (SELECT COUNT(*) 
           FROM Cita c 
           WHERE c.medicoId = ? AND DATE(c.fechaInicio) = CURDATE() AND c.estado != 'CANCELADA') as citasHoy,
          (SELECT COUNT(*) 
           FROM Cita c 
           WHERE c.medicoId = ? AND MONTH(c.fechaInicio) = MONTH(CURDATE()) AND YEAR(c.fechaInicio) = YEAR(CURDATE()) AND c.estado != 'CANCELADA') as consultasMes
      `, [decoded.medicoId, decoded.medicoId, decoded.medicoId]);

      await connection.end();

      if (!statsResult.length) {
        return res.status(404).json({
          error: 'STATS_NOT_FOUND',
          message: 'No se encontraron estadísticas'
        });
      }

      const stats = statsResult[0];
      
      // Formatear datos para el frontend
      const estadisticas = {
        totalPacientes: stats.totalPacientes || 0,
        citasHoy: stats.citasHoy || 0,
        consultasMes: stats.consultasMes || 0
      };

      console.log('[MEDICO STATS] Estadísticas obtenidas:', estadisticas);

      res.json(estadisticas);

    } catch (dbError) {
      await connection.end();
      console.error('[MEDICO STATS DB ERROR]', dbError.message);
      res.status(500).json({
        error: 'STATS_ERROR',
        message: 'Error al obtener estadísticas: ' + dbError.message
      });
    }

  } catch (error) {
    console.error('[MEDICO STATS ERROR]', error.message);
    res.status(500).json({
      error: 'STATS_ERROR',
      message: 'Error interno al obtener estadísticas'
    });
  }
});

// Endpoint para obtener citas de hoy del médico autenticado
app.get('/medico/citas/hoy', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, 'secretKey123');
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    
     console.log('[MEDICO CITAS HOY] Obteniendo citas de hoy para médico:', decoded.medicoId);

     // Conectar a la base de datos
     const connection = await getConnection();
     
     try {
       // Obtener citas de hoy del médico (máximo 3)
       const [citasResult] = await connection.execute(`
         SELECT 
           c.id,
           c.fechaInicio,
           c.fechaFin,
           c.estado,
           c.motivo,
           c.pacienteNombre,
           c.pacienteTelefono,
           c.pacienteEmail
         FROM Cita c
         WHERE c.medicoId = ? 
         AND DATE(c.fechaInicio) = CURDATE()
         AND c.estado = 'PROGRAMADA'
         ORDER BY c.fechaInicio ASC
         LIMIT 3
       `, [decoded.medicoId]);

       await connection.end();

       // Formatear datos para el frontend
       const citasHoy = citasResult.map(cita => {
         const fechaInicio = new Date(cita.fechaInicio);
         const fechaFin = new Date(cita.fechaFin);
         
         return {
           id: cita.id,
           fecha: fechaInicio.toISOString().split('T')[0],
           hora: fechaInicio.toTimeString().split(' ')[0].substring(0, 5),
           estado: cita.estado,
           motivo: cita.motivo || 'Consulta médica',
           paciente_nombres: cita.pacienteNombre ? cita.pacienteNombre.split(' ')[0] : 'Paciente',
           paciente_apellidos: cita.pacienteNombre ? cita.pacienteNombre.split(' ').slice(1).join(' ') : '',
           paciente_telefono: cita.pacienteTelefono || '',
           paciente_email: cita.pacienteEmail || ''
         };
       });

       console.log('[MEDICO CITAS HOY] Citas obtenidas:', citasHoy.length);

       res.json(citasHoy);

     } catch (dbError) {
       await connection.end();
       console.error('[MEDICO CITAS HOY DB ERROR]', dbError.message);
       res.status(500).json({
         error: 'CITAS_HOY_ERROR',
         message: 'Error al obtener citas de hoy: ' + dbError.message
       });
     }
    
  } catch (error) {
    console.error('[MEDICO CITAS HOY ERROR]', error.message);
    res.status(500).json({ 
      error: 'CITAS_HOY_ERROR', 
      message: 'Error interno al obtener citas de hoy' 
    });
  }
});

// Endpoint para crear nueva cita
app.post('/medico/citas', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, 'secretKey123');
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    
    const { 
      inicio, 
      fin, 
      motivo, 
      observaciones, 
      paciente,
      medicoId,
      estado
    } = req.body;
    
    console.log('[CREATE CITA] Datos recibidos:', { inicio, fin, motivo, observaciones, paciente, medicoId, estado });
    
    // Validar datos requeridos
    if (!inicio || !motivo || !paciente) {
      return res.status(400).json({ 
        message: 'Faltan datos requeridos: inicio, motivo, paciente' 
      });
    }
    
    // Usar la estructura correcta de la base de datos
    const fechaInicio = inicio;
    const fechaFin = fin || inicio; // Si no se proporciona fin, usar inicio
    
    // Conectar a la base de datos
    const connection = await getConnection();
    
    try {
      // Obtener hospital del médico
      const [medicoData] = await connection.execute(
        'SELECT hospitalId FROM Medico WHERE id = ?',
        [medicoId || decoded.medicoId]
      );
      
      if (!medicoData.length) {
        await connection.end();
        return res.status(400).json({
          error: 'MEDICO_NOT_FOUND',
          message: 'Médico no encontrado'
        });
      }
      
      const hospitalId = medicoData[0].hospitalId;
      
      // Crear o encontrar paciente
      let pacienteId = null;
      if (paciente.documento) {
        const [existingPaciente] = await connection.execute(
          'SELECT id FROM Paciente WHERE documento = ? AND hospitalId = ?',
          [paciente.documento, hospitalId]
        );
        
        if (existingPaciente.length > 0) {
          pacienteId = existingPaciente[0].id;
        } else {
          // Crear nuevo paciente
          const [pacienteResult] = await connection.execute(`
            INSERT INTO Paciente (hospitalId, nombres, apellidos, fechaNacimiento, sexo, telefono, email, documento, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
          `, [
            hospitalId,
            paciente.nombres,
            paciente.apellidos,
            paciente.fechaNacimiento,
            paciente.sexo,
            paciente.telefono,
            paciente.email,
            paciente.documento
          ]);
          pacienteId = pacienteResult.insertId;
        }
        }
        
        // Validar solapamiento antes de insertar
        const [overlapCheck] = await connection.execute(`
          SELECT id FROM Cita 
          WHERE medicoId = ? 
          AND estado != 'CANCELADA'
          AND NOT (fechaFin <= ? OR fechaInicio >= ?)
        `, [medicoId || decoded.medicoId, fechaInicio, fechaFin]);
        
        if (overlapCheck.length > 0) {
          await connection.end();
          return res.status(400).json({
            error: 'OVERLAP_CONFLICT',
            message: 'La cita se solapa con otra cita existente en el mismo horario'
          });
        }
        
        console.log('[CREATE CITA] Insertando cita con datos:', {
          fechaInicio, fechaFin, motivo, observaciones,
        pacienteId, medicoId: medicoId || decoded.medicoId, hospitalId
      });
      
      // Insertar la cita usando la estructura correcta
      const [citaResult] = await connection.execute(`
        INSERT INTO Cita (
          hospitalId, medicoId, pacienteId, pacienteNombre, pacienteTelefono, pacienteEmail,
          motivo, fechaInicio, fechaFin, estado, creadaPorId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        hospitalId,
        medicoId || decoded.medicoId,
        pacienteId,
        paciente.nombres + ' ' + paciente.apellidos,
        paciente.telefono,
        paciente.email,
        motivo,
        fechaInicio,
        fechaFin,
        estado || 'PROGRAMADA',
        decoded.id
      ]);
      
      const newCitaId = citaResult.insertId;
      console.log('[CREATE CITA] Cita insertada en BD con ID:', newCitaId);
      
      await connection.end();
      
      // Crear objeto de respuesta con los datos correctos
      const newCita = {
        id: newCitaId,
        fechaInicio,
        fechaFin,
        motivo,
        observaciones: observaciones || '',
        pacienteId,
        hospitalId,
        medicoId: medicoId || decoded.medicoId,
        estado: estado || 'PROGRAMADA',
        pacienteNombre: paciente.nombres + ' ' + paciente.apellidos,
        pacienteTelefono: paciente.telefono,
        pacienteEmail: paciente.email,
        hospitalNombre: 'Hospital Central'
      };
      
      res.status(201).json({
        id: newCitaId,
        message: 'Cita creada exitosamente',
        cita: newCita
      });
      
    } catch (dbError) {
      await connection.end();
      console.error('[CREATE CITA DB ERROR]', dbError.message);
      res.status(500).json({
        error: 'CREATE_CITA_ERROR',
        message: 'Error al insertar en la base de datos: ' + dbError.message
      });
      return;
    }
    
  } catch (error) {
    console.error('[MEDICO CREATE CITA ERROR]', error.message);
    res.status(500).json({
      error: 'CREATE_CITA_ERROR',
      message: 'Error interno al crear cita'
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