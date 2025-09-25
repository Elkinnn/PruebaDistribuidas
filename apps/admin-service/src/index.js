// apps/admin-service/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.ADMIN_SERVICE_PORT || 3001;

/* ------------ Health de BD (ping) ------------ */
app.get('/db/health', async (_req, res) => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospitalservice',
    });
    await conn.query('SELECT 1');
    await conn.end();
    res.json({ ok: true, db: 'up' });
  } catch (e) {
    res.status(500).json({ ok: false, db: 'down', error: e.message });
  }
});

/* ------------ Estado del servicio automático ------------ */
app.get('/auto-cancel/status', (_req, res) => {
  const status = autoCancelService.getStatus();
  res.json({
    ok: true,
    autoCancelService: status
  });
});

/* ------------ Importar rutas ------------ */
const authRouter = require('./presentation/routes/auth.routes');
const { auth, requireRole } = require('./presentation/middlewares/auth');

const hospitalesRouter = require('./presentation/routes/hospital.routes');
const especialidadesRouter = require('./presentation/routes/especialidad.routes');
const hospEspRouter = require('./presentation/routes/hospital-especialidad.routes');

const medicosRouter = require('./presentation/routes/medico.routes');
const medicoEspecialidadRouter = require('./presentation/routes/medico-especialidad.routes');

const empleadosRouter = require('./presentation/routes/empleado.routes');

const citaAdminRouter  = require('./presentation/routes/cita.admin.routes');

// Servicio automático de cancelación de citas
const autoCancelService = require('./infrastructure/services/auto-cancel.service');

/* ------------ Rutas públicas ------------ */
// Login (no requiere token)
app.use(authRouter);



/* ------------ Rutas protegidas (ADMIN) ------------ */
// CRUDs de admin con prefijos claros
app.use('/hospitales',     auth, requireRole('ADMIN_GLOBAL'), hospitalesRouter);
app.use('/especialidades', auth, requireRole('ADMIN_GLOBAL'), especialidadesRouter);

// asignación hospital-Especialidad bajo /hospitales
app.use('/hospitales',     auth, requireRole('ADMIN_GLOBAL'), hospEspRouter);

// CRUD de médicos y asignación médico-especialidad bajo /medicos
app.use('/medicos',        auth, requireRole('ADMIN_GLOBAL'), medicosRouter);
app.use('/medicos',        auth, requireRole('ADMIN_GLOBAL'), medicoEspecialidadRouter);

// CRUD de empleados bajo /empleados
app.use('/empleados',      auth, requireRole('ADMIN_GLOBAL'), empleadosRouter);

// Ruta específica para KPIs (sin autenticación estricta para dashboard)
app.get('/citas/kpis', async (req, res) => {
  try {
    const repo = require('./infrastructure/persistence/cita.repo');
    const result = await repo.getKpisDashboard({
      desde: req.query.desde,
      hasta: req.query.hasta,
      hospitalId: req.query.hospitalId
    });
    res.json({ data: result });
  } catch (e) {
    console.error('Error obteniendo KPIs:', e.message);
    res.status(500).json({ error: 'ERROR_KPIS', message: e.message });
  }
});

// Citas de admin bajo /citas (después de la ruta específica)
app.use('/citas',          auth, requireRole('ADMIN_GLOBAL'), citaAdminRouter);

/* ------------ 404 y errores ------------ */
app.use((_req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: 'Recurso no encontrado' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message || 'Error del servidor' });
});

/* ------------ Arranque ------------ */
app.listen(PORT, () => {
  console.log(`AdminService (Express) escuchando en :${PORT}`);
  
  // Iniciar servicio automático de cancelación de citas
  autoCancelService.start();
});
