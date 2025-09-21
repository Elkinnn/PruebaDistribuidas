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

/* ------------ Rutas de dominio ------------ */
// Hospitales CRUD
const hospitalesRouter = require('./presentation/routes/hospital.routes');
app.use('/hospitales', hospitalesRouter);

// Especialidades CRUD
const especialidadesRouter = require('./presentation/routes/especialidad.routes');
app.use('/especialidades', especialidadesRouter);

// Asignación Hospital ↔ Especialidad
// expone: 
//   GET    /hospitales/:hospitalId/especialidades
//   POST   /hospitales/:hospitalId/especialidades/:especialidadId
//   DELETE /hospitales/:hospitalId/especialidades/:especialidadId
const hospEspRouter = require('./presentation/routes/hospital-especialidad.routes');
app.use('/', hospEspRouter);

// Médicos CRUD
const medicosRouter = require('./presentation/routes/medico.routes');
app.use('/medicos', medicosRouter);

const medicoEspecialidadRouter = require('./presentation/routes/medico-especialidad.routes');
app.use('/', medicoEspecialidadRouter);



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
