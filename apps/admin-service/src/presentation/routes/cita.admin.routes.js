const { Router } = require('express');
const repo = require('../../infrastructure/persistence/cita.repo');
const { createCitaAdminSchema, updateAdminSchema } = require('../validators/cita.schema');

const router = Router();

// MONTADO EN /citas DESDE index.js

// GET /citas?page=&size=&hospitalId=&medicoId=&estado=&desde=&hasta=&q=
router.get('/', async (req, res) => {
  try {
    const result = await repo.list({
      page: +req.query.page || 1,
      size: +req.query.size || 20,
      hospitalId: req.query.hospitalId,
      medicoId: req.query.medicoId,
      estado: req.query.estado,
      desde: req.query.desde,
      hasta: req.query.hasta,
      q: req.query.q
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'ERROR_LIST', message: e.message });
  }
});

// GET /citas/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await repo.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Cita no encontrada' });
    res.json({ data: item });
  } catch (e) {
    res.status(500).json({ error: 'ERROR_GET', message: e.message });
  }
});

// POST /citas
router.post('/', async (req, res) => {
  try {
    console.log('🔍 [CITA ADMIN] Request body:', JSON.stringify(req.body, null, 2));
    const { error, value } = createCitaAdminSchema.validate(req.body, { abortEarly: false });
    if (error) {
      console.log('❌ [CITA ADMIN] Validation error:', error.details);
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details });
    }
    console.log('✅ [CITA ADMIN] Validation passed, creating cita...');
    const item = await repo.createAdmin({ ...value, creadaPorId: req.user.id });
    console.log('✅ [CITA ADMIN] Cita created successfully:', item.id);
    res.status(201).json({ data: item });
  } catch (e) {
    console.log('❌ [CITA ADMIN] Error creating cita:', e.message);
    const status = e.status || 500;
    res.status(status).json({ error: status === 409 ? 'CONFLICT' : 'ERROR_CREATE', message: e.message });
  }
});

// PUT /citas/:id
router.put('/:id', async (req, res) => {
  try {
    const { error, value } = updateAdminSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details });
    const item = await repo.updateAdmin(req.params.id, value, req.user.id);
    if (!item) return res.status(404).json({ error: 'NOT_FOUND', message: 'Cita no encontrada' });
    res.json({ data: item });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ error: status === 409 ? 'CONFLICT' : 'ERROR_UPDATE', message: e.message });
  }
});

// DELETE /citas/:id
router.delete('/:id', async (req, res) => {
  try {
    const ok = await repo.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'NOT_FOUND', message: 'Cita no encontrada' });
    res.json({ data: true });
  } catch (e) {
    res.status(500).json({ error: 'ERROR_DELETE', message: e.message });
  }
});

// POST /citas/cancelar-pasadas
router.post('/cancelar-pasadas', async (req, res) => {
  try {
    const result = await repo.cancelarCitasPasadas();
    res.json({ data: result });
  } catch (e) {
    res.status(500).json({ error: 'ERROR_CANCEL_PAST', message: e.message });
  }
});


// GET /citas/kpis?desde=&hasta=&hospitalId=
router.get('/kpis', async (req, res) => {
  try {
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

// GET /citas/graficas?desde=&hasta=&hospitalId=
router.get('/graficas', async (req, res) => {
  try {
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

// GET /citas/reportes/citas-detalladas?desde=&hasta=&hospitalId=
router.get('/reportes/citas-detalladas', async (req, res) => {
  try {
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

// GET /citas/reportes/resumen-especialidad?desde=&hasta=&hospitalId=
router.get('/reportes/resumen-especialidad', async (req, res) => {
  try {
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

// GET /citas/reportes/productividad-medico?desde=&hasta=&hospitalId=
router.get('/reportes/productividad-medico', async (req, res) => {
  try {
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

module.exports = router;
