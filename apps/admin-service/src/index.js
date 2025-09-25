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

// Ruta específica para Gráficas (sin autenticación estricta para dashboard)
app.get('/citas/graficas', async (req, res) => {
  try {
    const repo = require('./infrastructure/persistence/cita.repo');
    const result = await repo.getGraficasData({
      desde: req.query.desde,
      hasta: req.query.hasta,
      hospitalId: req.query.hospitalId
    });
    res.json({ data: result });
  } catch (e) {
    console.error('Error obteniendo datos de gráficas:', e.message);
    res.status(500).json({ error: 'ERROR_GRAFICAS', message: e.message });
  }
});

// Ruta de prueba para PDF simple
app.get('/test-pdf', async (req, res) => {
  try {
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Test PDF', 20, 20);
    doc.text('Este es un PDF de prueba', 20, 30);
    doc.text('Fecha: ' + new Date().toLocaleDateString(), 20, 40);
    
    const pdfBuffer = doc.output('arraybuffer');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="test.pdf"');
    res.send(Buffer.from(pdfBuffer));
  } catch (e) {
    console.error('Error generando PDF de prueba:', e.message);
    res.status(500).json({ error: 'ERROR_PDF_TEST', message: e.message });
  }
});

// Rutas específicas para Reportes (sin autenticación estricta para dashboard)
app.get('/citas/reportes/citas-detalladas', async (req, res) => {
  try {
    const repo = require('./infrastructure/persistence/cita.repo');
    const data = await repo.getReporteCitasDetalladas({
      desde: req.query.desde,
      hasta: req.query.hasta,
      hospitalId: req.query.hospitalId
    });
    
    // Generar PDF con configuración correcta
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Header
    doc.setFontSize(16);
    doc.text('Sistema de Citas Medicas', 20, 20);
    doc.setFontSize(12);
    doc.text('Reporte de Citas Detalladas', 20, 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 40);
    
    if (req.query.desde && req.query.hasta) {
      doc.text(`Periodo: ${req.query.desde} - ${req.query.hasta}`, 20, 50);
    }
    
    let y = 70;
    doc.setFontSize(10);
    
    // Encabezados
    doc.text('ID', 20, y);
    doc.text('Hospital', 40, y);
    doc.text('Medico', 80, y);
    doc.text('Paciente', 120, y);
    doc.text('Estado', 160, y);
    
    y += 10;
    
    // Datos
    doc.setFontSize(9);
    if (data && data.length > 0) {
      data.slice(0, 25).forEach((item) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        doc.text(String(item.id || 'N/A'), 20, y);
        doc.text(String(item.hospital || 'N/A').substring(0, 15), 40, y);
        doc.text(String(item.medico || 'N/A').substring(0, 15), 80, y);
        doc.text(String(item.paciente || 'N/A').substring(0, 15), 120, y);
        doc.text(String(item.estado || 'N/A'), 160, y);
        
        y += 8;
      });
    } else {
      doc.text('No hay datos disponibles', 20, y);
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Pagina ${i} de ${pageCount}`, 20, 290);
    }
    
    // Generar PDF como buffer binario
    const pdfBuffer = doc.output('arraybuffer');
    const buffer = Buffer.from(pdfBuffer);
    
    // Headers correctos para PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="citas-detalladas-${req.query.desde || 'all'}-${req.query.hasta || 'all'}.pdf"`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');
    
    // Enviar como binario
    res.end(buffer);
  } catch (e) {
    console.error('Error generando reporte de citas detalladas:', e.message);
    res.status(500).json({ error: 'ERROR_REPORTE_CITAS', message: e.message });
  }
});

app.get('/citas/reportes/resumen-especialidad', async (req, res) => {
  try {
    const repo = require('./infrastructure/persistence/cita.repo');
    const data = await repo.getReporteResumenEspecialidad({
      desde: req.query.desde,
      hasta: req.query.hasta,
      hospitalId: req.query.hospitalId
    });
    
    // Generar PDF con configuración correcta
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Header
    doc.setFontSize(16);
    doc.text('Sistema de Citas Medicas', 20, 20);
    doc.setFontSize(12);
    doc.text('Resumen por Especialidad', 20, 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 40);
    
    if (req.query.desde && req.query.hasta) {
      doc.text(`Periodo: ${req.query.desde} - ${req.query.hasta}`, 20, 50);
    }
    
    let y = 70;
    doc.setFontSize(10);
    
    // Encabezados
    doc.text('Especialidad', 20, y);
    doc.text('Total', 80, y);
    doc.text('Atendidas', 100, y);
    doc.text('Canceladas', 130, y);
    doc.text('Programadas', 160, y);
    doc.text('% Atencion', 190, y);
    
    y += 10;
    
    // Datos
    doc.setFontSize(9);
    if (data && data.length > 0) {
      data.forEach((item) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        doc.text(String(item.especialidad || 'N/A').substring(0, 20), 20, y);
        doc.text(String(item.totalCitas || 0), 80, y);
        doc.text(String(item.atendidas || 0), 100, y);
        doc.text(String(item.canceladas || 0), 130, y);
        doc.text(String(item.programadas || 0), 160, y);
        doc.text(`${String(item.porcentajeAtencion || 0)}%`, 190, y);
        
        y += 8;
      });
    } else {
      doc.text('No hay datos disponibles', 20, y);
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Pagina ${i} de ${pageCount}`, 20, 290);
    }
    
    // Generar PDF como buffer binario
    const pdfBuffer = doc.output('arraybuffer');
    const buffer = Buffer.from(pdfBuffer);
    
    // Headers correctos para PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="resumen-especialidad-${req.query.desde || 'all'}-${req.query.hasta || 'all'}.pdf"`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');
    
    // Enviar como binario
    res.end(buffer);
  } catch (e) {
    console.error('Error generando reporte de especialidades:', e.message);
    res.status(500).json({ error: 'ERROR_REPORTE_ESPECIALIDADES', message: e.message });
  }
});

app.get('/citas/reportes/productividad-medico', async (req, res) => {
  try {
    const repo = require('./infrastructure/persistence/cita.repo');
    const data = await repo.getReporteProductividadMedico({
      desde: req.query.desde,
      hasta: req.query.hasta,
      hospitalId: req.query.hospitalId
    });
    
    // Generar PDF con configuración correcta
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Header
    doc.setFontSize(16);
    doc.text('Sistema de Citas Medicas', 20, 20);
    doc.setFontSize(12);
    doc.text('Productividad por Medico', 20, 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 40);
    
    if (req.query.desde && req.query.hasta) {
      doc.text(`Periodo: ${req.query.desde} - ${req.query.hasta}`, 20, 50);
    }
    
    let y = 70;
    doc.setFontSize(10);
    
    // Encabezados
    doc.text('Medico', 20, y);
    doc.text('Especialidades', 80, y);
    doc.text('Total', 140, y);
    doc.text('Atendidas', 160, y);
    doc.text('Canceladas', 190, y);
    
    y += 10;
    
    // Datos
    doc.setFontSize(9);
    if (data && data.length > 0) {
      data.forEach((item) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        doc.text(String(item.medico || 'N/A').substring(0, 25), 20, y);
        doc.text(String(item.especialidades || 'N/A').substring(0, 20), 80, y);
        doc.text(String(item.totalCitas || 0), 140, y);
        doc.text(String(item.atendidas || 0), 160, y);
        doc.text(String(item.canceladas || 0), 190, y);
        
        y += 8;
      });
    } else {
      doc.text('No hay datos disponibles', 20, y);
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Pagina ${i} de ${pageCount}`, 20, 290);
    }
    
    // Generar PDF como buffer binario
    const pdfBuffer = doc.output('arraybuffer');
    const buffer = Buffer.from(pdfBuffer);
    
    // Headers correctos para PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="productividad-medico-${req.query.desde || 'all'}-${req.query.hasta || 'all'}.pdf"`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');
    
    // Enviar como binario
    res.end(buffer);
  } catch (e) {
    console.error('Error generando reporte de productividad:', e.message);
    res.status(500).json({ error: 'ERROR_REPORTE_PRODUCTIVIDAD', message: e.message });
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
