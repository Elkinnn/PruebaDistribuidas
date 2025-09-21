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

/* ------------ Importar rutas ------------ */
const hospitalesRouter = require('./presentation/routes/hospital.routes');
const especialidadesRouter = require('./presentation/routes/especialidad.routes');
const hospEspRouter = require('./presentation/routes/hospital-especialidad.routes');
const medicosRouter = require('./presentation/routes/medico.routes');
const medicoEspecialidadRouter = require('./presentation/routes/medico-especialidad.routes');

const authRouter = require('./presentation/routes/auth.routes');
const { auth, requireRole } = require('./presentation/middlewares/auth');

const citaAdminRouter  = require('./presentation/routes/cita.admin.routes');
const citaMedicoRouter = require('./presentation/routes/cita.medico.routes');


/* ------------ Rutas públicas ------------ */
// Exponer login (NO requiere token)
app.use(authRouter);

/* ------------ Rutas protegidas ------------ */
// Solo ADMIN_GLOBAL puede manejar estos CRUD
app.use('/hospitales', auth, requireRole('ADMIN_GLOBAL'), hospitalesRouter);
app.use('/especialidades', auth, requireRole('ADMIN_GLOBAL'), especialidadesRouter);
app.use('/', auth, requireRole('ADMIN_GLOBAL'), hospEspRouter);
app.use('/medicos', auth, requireRole('ADMIN_GLOBAL'), medicosRouter);
app.use('/', auth, requireRole('ADMIN_GLOBAL'), medicoEspecialidadRouter);


// Rutas admin (CRUD completo)
app.use('/', auth, requireRole('ADMIN_GLOBAL'), citaAdminRouter);

// Rutas médico (sus propias citas)
app.use('/', auth, requireRole('MEDICO'), citaMedicoRouter);

/* ------------ 404 y manejador de errores ------------ */
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
});





