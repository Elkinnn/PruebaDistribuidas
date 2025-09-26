const { jsPDF } = require('jspdf');

class PDFGeneratorService {
  constructor() {
    this.doc = null;
  }

  createDocument() {
    this.doc = new jsPDF();
    return this;
  }

  addHeader(title) {
    this.doc.setFontSize(16);
    this.doc.text('Sistema de Citas Medicas', 20, 20);
    
    this.doc.setFontSize(12);
    this.doc.text(title, 20, 30);
    
    const fecha = new Date().toLocaleDateString('es-ES');
    this.doc.text(`Fecha: ${fecha}`, 20, 40);
    
    return this;
  }

  addFooter() {
    const pageCount = this.doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.text(`Pagina ${i} de ${pageCount}`, 20, 290);
    }
    
    return this;
  }

  generateCitasDetalladasReport(data, fechaDesde, fechaHasta) {
    this.createDocument();
    this.addHeader('Reporte de Citas Detalladas');
    
    if (fechaDesde && fechaHasta) {
      this.doc.text(`Periodo: ${fechaDesde} - ${fechaHasta}`, 20, 50);
    }
    
    let y = 70;
    this.doc.setFontSize(10);
    
    // Encabezados
    this.doc.text('ID', 20, y);
    this.doc.text('Hospital', 40, y);
    this.doc.text('Medico', 80, y);
    this.doc.text('Paciente', 120, y);
    this.doc.text('Especialidad', 160, y);
    this.doc.text('Estado', 190, y);
    
    y += 10;
    
    // Verificar si hay datos
    if (!data || data.length === 0) {
      this.doc.text('No hay datos disponibles para el periodo seleccionado', 20, y);
      return this.addFooter().doc;
    }
    
    // Datos
    this.doc.setFontSize(9);
    
    data.slice(0, 25).forEach((item) => {
      if (y > 270) {
        this.doc.addPage();
        y = 20;
      }
      
      try {
        this.doc.text(String(item.id || 'N/A'), 20, y);
        this.doc.text(String(item.hospital || 'N/A').substring(0, 15), 40, y);
        this.doc.text(String(item.medico || 'N/A').substring(0, 15), 80, y);
        this.doc.text(String(item.paciente || 'N/A').substring(0, 15), 120, y);
        this.doc.text(String(item.especialidad || 'N/A').substring(0, 15), 160, y);
        this.doc.text(String(item.estado || 'N/A'), 190, y);
        
        y += 8;
      } catch (error) {
        console.error('Error procesando item:', error);
        this.doc.text('Error en datos', 20, y);
        y += 8;
      }
    });

    return this.addFooter().doc;
  }

  generateResumenEspecialidadReport(data, fechaDesde, fechaHasta) {
    this.createDocument();
    this.addHeader('Resumen por Especialidad');
    
    if (fechaDesde && fechaHasta) {
      this.doc.text(`Periodo: ${fechaDesde} - ${fechaHasta}`, 20, 50);
    }
    
    let y = 70;
    this.doc.setFontSize(10);
    
    // Encabezados
    this.doc.text('Especialidad', 20, y);
    this.doc.text('Total', 80, y);
    this.doc.text('Atendidas', 100, y);
    this.doc.text('Canceladas', 130, y);
    this.doc.text('Programadas', 160, y);
    this.doc.text('% Atencion', 190, y);
    
    y += 10;
    
    // Verificar si hay datos
    if (!data || data.length === 0) {
      this.doc.text('No hay datos disponibles para el periodo seleccionado', 20, y);
      return this.addFooter().doc;
    }
    
    // Datos
    this.doc.setFontSize(9);
    
    data.forEach((item) => {
      if (y > 270) {
        this.doc.addPage();
        y = 20;
      }
      
      try {
        this.doc.text(String(item.especialidad || 'N/A').substring(0, 20), 20, y);
        this.doc.text(String(item.totalCitas || 0), 80, y);
        this.doc.text(String(item.atendidas || 0), 100, y);
        this.doc.text(String(item.canceladas || 0), 130, y);
        this.doc.text(String(item.programadas || 0), 160, y);
        this.doc.text(`${String(item.porcentajeAtencion || 0)}%`, 190, y);
        
        y += 8;
      } catch (error) {
        console.error('Error procesando item:', error);
        this.doc.text('Error en datos', 20, y);
        y += 8;
      }
    });

    // Resumen
    try {
      y += 10;
      const totalCitas = data.reduce((sum, item) => sum + (item.totalCitas || 0), 0);
      const totalAtendidas = data.reduce((sum, item) => sum + (item.atendidas || 0), 0);
      
      this.doc.setFontSize(10);
      this.doc.text('Resumen General:', 20, y);
      
      y += 10;
      this.doc.setFontSize(9);
      this.doc.text(`Total de citas: ${totalCitas}`, 20, y);
      y += 8;
      this.doc.text(`Citas atendidas: ${totalAtendidas}`, 20, y);
    } catch (error) {
      console.error('Error calculando resumen:', error);
    }

    return this.addFooter().doc;
  }

  generateProductividadMedicoReport(data, fechaDesde, fechaHasta) {
    this.createDocument();
    this.addHeader('Productividad por Medico');
    
    if (fechaDesde && fechaHasta) {
      this.doc.text(`Periodo: ${fechaDesde} - ${fechaHasta}`, 20, 50);
    }
    
    let y = 70;
    this.doc.setFontSize(10);
    
    // Encabezados
    this.doc.text('Medico', 20, y);
    this.doc.text('Especialidades', 80, y);
    this.doc.text('Total', 140, y);
    this.doc.text('Atendidas', 160, y);
    this.doc.text('Canceladas', 190, y);
    
    y += 10;
    
    // Verificar si hay datos
    if (!data || data.length === 0) {
      this.doc.text('No hay datos disponibles para el periodo seleccionado', 20, y);
      return this.addFooter().doc;
    }
    
    // Datos
    this.doc.setFontSize(9);
    
    data.forEach((item) => {
      if (y > 270) {
        this.doc.addPage();
        y = 20;
      }
      
      try {
        this.doc.text(String(item.medico || 'N/A').substring(0, 25), 20, y);
        this.doc.text(String(item.especialidades || 'N/A').substring(0, 20), 80, y);
        this.doc.text(String(item.totalCitas || 0), 140, y);
        this.doc.text(String(item.atendidas || 0), 160, y);
        this.doc.text(String(item.canceladas || 0), 190, y);
        
        y += 8;
      } catch (error) {
        console.error('Error procesando item:', error);
        this.doc.text('Error en datos', 20, y);
        y += 8;
      }
    });

    // Destacados
    try {
      if (data.length > 0) {
        y += 10;
        const mejorMedico = data[0];
        
        this.doc.setFontSize(10);
        this.doc.text('Destacados:', 20, y);
        
        y += 10;
        this.doc.setFontSize(9);
        this.doc.text(`Medico con mas citas: ${String(mejorMedico.medico || 'N/A')} (${String(mejorMedico.totalCitas || 0)} citas)`, 20, y);
      }
    } catch (error) {
      console.error('Error calculando destacados:', error);
    }

    return this.addFooter().doc;
  }
}

module.exports = PDFGeneratorService;