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
    
    // Header con diseño profesional
    doc.setFillColor(41, 128, 185); // Azul profesional
    doc.rect(0, 0, 210, 30, 'F');
    
    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Sistema de Citas Médicas', 20, 20);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Reporte de Citas Detalladas', 20, 27);
    
    // Resetear color para el contenido
    doc.setTextColor(0, 0, 0);
    
    // Información del reporte
    let y = 45;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Información del Reporte:', 20, y);
    
    y += 8;
    doc.setFont(undefined, 'normal');
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, y);
    
    y += 6;
    if (req.query.desde && req.query.hasta) {
      doc.text(`Período: ${req.query.desde} al ${req.query.hasta}`, 20, y);
    } else {
      doc.text('Período: Todos los registros', 20, y);
    }
    
    y += 6;
    doc.text(`Total de registros: ${data ? data.length : 0}`, 20, y);
    
    y += 15;
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 10;
    
    // Tabla con encabezados
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setFillColor(245, 245, 245);
    
    // Encabezados de la tabla
    doc.rect(20, y-5, 170, 8, 'F');
    doc.text('ID', 22, y);
    doc.text('Hospital', 35, y);
    doc.text('Médico', 75, y);
    doc.text('Paciente', 115, y);
    doc.text('Estado', 155, y);
    doc.text('Fecha', 175, y);
    
    y += 8;
    
    // Datos de la tabla
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    
    if (data && data.length > 0) {
      data.slice(0, 35).forEach((item, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
          
          // Repetir encabezados en nueva página
          doc.setFontSize(9);
          doc.setFont(undefined, 'bold');
          doc.setFillColor(245, 245, 245);
          doc.rect(20, y-5, 170, 8, 'F');
          doc.text('ID', 22, y);
          doc.text('Hospital', 35, y);
          doc.text('Médico', 75, y);
          doc.text('Paciente', 115, y);
          doc.text('Estado', 155, y);
          doc.text('Fecha', 175, y);
          y += 8;
          doc.setFont(undefined, 'normal');
          doc.setFontSize(8);
        }
        
        // Alternar colores de fila
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(20, y-3, 170, 6, 'F');
        }
        
        // Color del estado
        const estado = String(item.estado || 'N/A');
        if (estado === 'ATENDIDA') {
          doc.setTextColor(0, 128, 0);
        } else if (estado === 'CANCELADA') {
          doc.setTextColor(220, 53, 69);
        } else {
          doc.setTextColor(255, 193, 7);
        }
        
        doc.text(String(item.id || 'N/A'), 22, y);
        doc.text(String(item.hospital || 'N/A').substring(0, 20), 35, y);
        doc.text(String(item.medico || 'N/A').substring(0, 20), 75, y);
        doc.text(String(item.paciente || 'N/A').substring(0, 20), 115, y);
        doc.text(estado, 155, y);
        
        // Resetear color para fecha
        doc.setTextColor(0, 0, 0);
        if (item.fechaInicio) {
          doc.text(String(item.fechaInicio).substring(0, 10), 175, y);
        } else {
          doc.text('N/A', 175, y);
        }
        
        y += 6;
      });
    } else {
      doc.setTextColor(128, 128, 128);
      doc.setFont(undefined, 'italic');
      doc.text('No hay datos disponibles para el período seleccionado', 20, y);
    }
    
    // Footer profesional
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Línea del footer
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 280, 190, 280);
      
      // Información del footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Página ${i} de ${pageCount}`, 20, 285);
      doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`, 120, 285);
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
    
    // Header con diseño profesional (igual que citas detalladas)
    doc.setFillColor(41, 128, 185); // Azul profesional
    doc.rect(0, 0, 210, 30, 'F');
    
    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Sistema de Citas Médicas', 20, 20);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Resumen por Especialidad', 20, 27);
    
    // Resetear color para el contenido
    doc.setTextColor(0, 0, 0);
    
    // Información del reporte
    let y = 45;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Información del Reporte:', 20, y);
    
    y += 8;
    doc.setFont(undefined, 'normal');
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, y);
    
    y += 6;
    if (req.query.desde && req.query.hasta) {
      doc.text(`Período: ${req.query.desde} al ${req.query.hasta}`, 20, y);
    } else {
      doc.text('Período: Todos los registros', 20, y);
    }
    
    y += 6;
    doc.text(`Total de registros: ${data ? data.length : 0}`, 20, y);
    
    y += 15;
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 10;
    
    // Tabla con formato profesional mejorado
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setFillColor(52, 73, 94); // Azul oscuro para encabezados
    doc.setTextColor(255, 255, 255);
    
    // Encabezados de la tabla con bordes
    doc.rect(20, y-5, 170, 10, 'F');
    doc.text('Especialidad', 25, y+2);
    doc.text('Total', 80, y+2);
    doc.text('Atendidas', 100, y+2);
    doc.text('Canceladas', 125, y+2);
    doc.text('Programadas', 150, y+2);
    doc.text('% Atención', 175, y+2);
    
    y += 10;
    
    // Datos de la tabla con mejor formato
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    if (data && data.length > 0) {
      data.forEach((item, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
          
          // Repetir encabezados en nueva página
          doc.setFontSize(10);
          doc.setFont(undefined, 'bold');
          doc.setFillColor(52, 73, 94);
          doc.setTextColor(255, 255, 255);
          doc.rect(20, y-5, 170, 10, 'F');
          doc.text('Especialidad', 25, y+2);
          doc.text('Total', 80, y+2);
          doc.text('Atendidas', 100, y+2);
          doc.text('Canceladas', 125, y+2);
          doc.text('Programadas', 150, y+2);
          doc.text('% Atención', 175, y+2);
          y += 10;
          doc.setFont(undefined, 'normal');
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
        }
        
        // Alternar colores de fila con bordes
        if (index % 2 === 0) {
          doc.setFillColor(248, 249, 250);
        } else {
          doc.setFillColor(255, 255, 255);
        }
        doc.rect(20, y-3, 170, 8, 'F');
        
        // Bordes de la tabla
        doc.setDrawColor(200, 200, 200);
        doc.rect(20, y-3, 170, 8, 'S');
        
        // Contenido de las celdas
        doc.text(String(item.especialidad || 'N/A').substring(0, 18), 25, y+2);
        doc.text(String(item.totalCitas || 0), 80, y+2);
        
        // Colores para los números
        doc.setTextColor(0, 128, 0); // Verde para atendidas
        doc.text(String(item.atendidas || 0), 100, y+2);
        
        doc.setTextColor(220, 53, 69); // Rojo para canceladas
        doc.text(String(item.canceladas || 0), 125, y+2);
        
        doc.setTextColor(255, 193, 7); // Amarillo para programadas
        doc.text(String(item.programadas || 0), 150, y+2);
        
        // Resetear color para porcentajes
        doc.setTextColor(0, 0, 0);
        doc.text(`${String(item.porcentajeAtencion || 0)}%`, 175, y+2);
        
        y += 8;
      });
      
      // Resumen estadístico para especialidades
      y += 15;
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Resumen Estadístico:', 20, y);
      
      y += 8;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      
      const totalCitas = data.reduce((sum, item) => sum + (item.totalCitas || 0), 0);
      const totalAtendidas = data.reduce((sum, item) => sum + (item.atendidas || 0), 0);
      const totalCanceladas = data.reduce((sum, item) => sum + (item.canceladas || 0), 0);
      const totalProgramadas = data.reduce((sum, item) => sum + (item.programadas || 0), 0);
      const porcentajeAtencion = totalCitas > 0 ? ((totalAtendidas / totalCitas) * 100).toFixed(1) : 0;
      
      doc.text(`• Total de especialidades: ${data.length}`, 20, y);
      y += 6;
      doc.text(`• Total de citas: ${totalCitas}`, 20, y);
      y += 6;
      doc.text(`• Citas atendidas: ${totalAtendidas}`, 20, y);
      y += 6;
      doc.text(`• Citas canceladas: ${totalCanceladas}`, 20, y);
      y += 6;
      doc.text(`• Citas programadas: ${totalProgramadas}`, 20, y);
      y += 6;
      doc.text(`• Porcentaje de atención general: ${porcentajeAtencion}%`, 20, y);
    } else {
      doc.setTextColor(128, 128, 128);
      doc.setFont(undefined, 'italic');
      doc.text('No hay datos disponibles para el período seleccionado', 20, y);
    }
    
    // Footer profesional
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Línea del footer
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 280, 190, 280);
      
      // Información del footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Página ${i} de ${pageCount}`, 20, 285);
      doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`, 120, 285);
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
    
    // Header con diseño profesional (igual que citas detalladas)
    doc.setFillColor(41, 128, 185); // Azul profesional
    doc.rect(0, 0, 210, 30, 'F');
    
    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Sistema de Citas Médicas', 20, 20);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Productividad por Médico', 20, 27);
    
    // Resetear color para el contenido
    doc.setTextColor(0, 0, 0);
    
    // Información del reporte
    let y = 45;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Información del Reporte:', 20, y);
    
    y += 8;
    doc.setFont(undefined, 'normal');
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, y);
    
    y += 6;
    if (req.query.desde && req.query.hasta) {
      doc.text(`Período: ${req.query.desde} al ${req.query.hasta}`, 20, y);
    } else {
      doc.text('Período: Todos los registros', 20, y);
    }
    
    y += 6;
    doc.text(`Total de registros: ${data ? data.length : 0}`, 20, y);
    
    y += 15;
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 10;
    
    // Tabla con formato profesional mejorado
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setFillColor(52, 73, 94); // Azul oscuro para encabezados
    doc.setTextColor(255, 255, 255);
    
    // Encabezados de la tabla con bordes
    doc.rect(20, y-5, 170, 10, 'F');
    doc.text('Médico', 25, y+2);
    doc.text('Especialidades', 70, y+2);
    doc.text('Total', 120, y+2);
    doc.text('Atendidas', 140, y+2);
    doc.text('Canceladas', 160, y+2);
    doc.text('Duración Prom.', 185, y+2);
    
    y += 10;
    
    // Datos de la tabla con mejor formato
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    if (data && data.length > 0) {
      data.forEach((item, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
          
          // Repetir encabezados en nueva página
          doc.setFontSize(10);
          doc.setFont(undefined, 'bold');
          doc.setFillColor(52, 73, 94);
          doc.setTextColor(255, 255, 255);
          doc.rect(20, y-5, 170, 10, 'F');
          doc.text('Médico', 25, y+2);
          doc.text('Especialidades', 70, y+2);
          doc.text('Total', 120, y+2);
          doc.text('Atendidas', 140, y+2);
          doc.text('Canceladas', 160, y+2);
          doc.text('Duración Prom.', 185, y+2);
          y += 10;
          doc.setFont(undefined, 'normal');
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
        }
        
        // Alternar colores de fila con bordes
        if (index % 2 === 0) {
          doc.setFillColor(248, 249, 250);
        } else {
          doc.setFillColor(255, 255, 255);
        }
        doc.rect(20, y-3, 170, 8, 'F');
        
        // Bordes de la tabla
        doc.setDrawColor(200, 200, 200);
        doc.rect(20, y-3, 170, 8, 'S');
        
        // Contenido de las celdas
        doc.text(String(item.medico || 'N/A').substring(0, 20), 25, y+2);
        doc.text(String(item.especialidades || 'N/A').substring(0, 15), 70, y+2);
        doc.text(String(item.totalCitas || 0), 120, y+2);
        
        // Colores para los números
        doc.setTextColor(0, 128, 0); // Verde para atendidas
        doc.text(String(item.atendidas || 0), 140, y+2);
        
        doc.setTextColor(220, 53, 69); // Rojo para canceladas
        doc.text(String(item.canceladas || 0), 160, y+2);
        
        // Resetear color para duración
        doc.setTextColor(0, 0, 0);
        doc.text(String(item.duracionPromedio || '0 min'), 185, y+2);
        
        y += 8;
      });
      
      // Resumen estadístico para médicos
      y += 15;
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Resumen Estadístico:', 20, y);
      
      y += 8;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      
      const totalCitas = data.reduce((sum, item) => sum + (item.totalCitas || 0), 0);
      const totalAtendidas = data.reduce((sum, item) => sum + (item.atendidas || 0), 0);
      const totalCanceladas = data.reduce((sum, item) => sum + (item.canceladas || 0), 0);
      const porcentajeAtencion = totalCitas > 0 ? ((totalAtendidas / totalCitas) * 100).toFixed(1) : 0;
      const mejorMedico = data.reduce((max, item) => (item.totalCitas || 0) > (max.totalCitas || 0) ? item : max, data[0]);
      
      doc.text(`• Total de médicos: ${data.length}`, 20, y);
      y += 6;
      doc.text(`• Total de citas: ${totalCitas}`, 20, y);
      y += 6;
      doc.text(`• Citas atendidas: ${totalAtendidas}`, 20, y);
      y += 6;
      doc.text(`• Citas canceladas: ${totalCanceladas}`, 20, y);
      y += 6;
      doc.text(`• Porcentaje de atención general: ${porcentajeAtencion}%`, 20, y);
      y += 6;
      doc.text(`• Médico con más citas: ${mejorMedico?.medico || 'N/A'} (${mejorMedico?.totalCitas || 0} citas)`, 20, y);
    } else {
      doc.setTextColor(128, 128, 128);
      doc.setFont(undefined, 'italic');
      doc.text('No hay datos disponibles para el período seleccionado', 20, y);
    }
    
    // Footer profesional
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Línea del footer
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 280, 190, 280);
      
      // Información del footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Página ${i} de ${pageCount}`, 20, 285);
      doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`, 120, 285);
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
