const { jsPDF } = require('jspdf');

class PDFGeneratorService {
  constructor() {
    this.doc = null;
    this.colors = {
      primary: [16, 185, 129], // emerald-500
      secondary: [59, 130, 246], // blue-500
      accent: [147, 51, 234], // purple-500
      text: [30, 41, 59], // slate-800
      light: [241, 245, 249], // slate-100
      border: [226, 232, 240] // slate-200
    };
  }

  createDocument() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    return this;
  }

  addHeader(title, subtitle = '') {
    // Fondo del header
    this.doc.setFillColor(...this.colors.primary);
    this.doc.rect(0, 0, 210, 50, 'F');
    
    // Logo/Icono (simulado con texto estilizado)
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('🏥', 15, 20);
    this.doc.text('Sistema de Citas Médicas', 25, 20);
    
    // Título del reporte
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    const titleText = String(title || '').substring(0, 50);
    this.doc.text(titleText, 15, 32);
    
    // Subtítulo si existe
    if (subtitle) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      const subtitleText = String(subtitle || '').substring(0, 60);
      this.doc.text(subtitleText, 15, 38);
    }
    
    // Fecha de generación
    const fecha = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.doc.setFontSize(9);
    this.doc.text(`Generado el: ${fecha}`, 15, 44);
    
    // Línea decorativa
    this.doc.setDrawColor(...this.colors.secondary);
    this.doc.setLineWidth(2);
    this.doc.line(15, 47, 195, 47);
    
    return this;
  }

  addFooter() {
    const pageCount = this.doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Línea superior del footer
      this.doc.setDrawColor(...this.colors.border);
      this.doc.setLineWidth(0.5);
      this.doc.line(15, 280, 195, 280);
      
      // Información del footer
      this.doc.setTextColor(...this.colors.text);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      
      // Página actual
      this.doc.text(`Página ${i} de ${pageCount}`, 15, 285);
      
      // Fecha y hora
      const now = new Date();
      const fechaHora = now.toLocaleString('es-ES');
      const fechaHoraText = String(fechaHora || '').substring(0, 30);
      this.doc.text(fechaHoraText, 150, 285);
      
      // Sistema
      const sistemaText = String('Sistema de Gestión Hospitalaria' || '').substring(0, 40);
      this.doc.text(sistemaText, 15, 290);
    }
    
    return this;
  }

  addStyledTable(headers, data, startY = 60) {
    let y = startY;
    const numCols = headers.length;
    const totalWidth = 180;
    const colWidth = totalWidth / numCols;
    const colPositions = [];
    
    // Calcular posiciones de columnas dinámicamente
    for (let i = 0; i < numCols; i++) {
      colPositions.push(15 + (i * colWidth));
    }
    
    // Header de la tabla
    this.doc.setFillColor(...this.colors.secondary);
    this.doc.rect(15, y - 8, totalWidth, 12, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    
    headers.forEach((header, index) => {
      const maxWidth = colWidth - 5; // Margen de 5px
      const cellText = String(header || '').substring(0, Math.floor(maxWidth / 9));
      this.doc.text(cellText, colPositions[index], y);
    });
    
    y += 15;
    
    // Datos de la tabla
    this.doc.setTextColor(...this.colors.text);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    
    data.forEach((row, rowIndex) => {
      // Alternar colores de fila
      if (rowIndex % 2 === 0) {
        this.doc.setFillColor(...this.colors.light);
        this.doc.rect(15, y - 6, totalWidth, 8, 'F');
      }
      
      row.forEach((cell, colIndex) => {
        const maxWidth = colWidth - 5; // Margen de 5px
        const cellText = String(cell || 'N/A').substring(0, Math.floor(maxWidth / 8));
        this.doc.text(cellText, colPositions[colIndex], y);
      });
      
      y += 8;
      
      // Nueva página si es necesario
      if (y > 270) {
        this.doc.addPage();
        y = 60;
      }
    });
    
    return y;
  }

  addSummaryBox(title, items, y) {
    const boxHeight = Math.max(25, 15 + (items.length * 4));
    
    // Fondo del resumen
    this.doc.setFillColor(...this.colors.light);
    this.doc.rect(15, y, 180, boxHeight, 'F');
    
    // Borde
    this.doc.setDrawColor(...this.colors.border);
    this.doc.setLineWidth(1);
    this.doc.rect(15, y, 180, boxHeight, 'S');
    
    // Título del resumen
    this.doc.setTextColor(...this.colors.primary);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, 20, y + 8);
    
    // Items del resumen
    this.doc.setTextColor(...this.colors.text);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    
    items.forEach((item, index) => {
      const itemText = String(item || '').substring(0, 80);
      this.doc.text(`• ${itemText}`, 20, y + 15 + (index * 4));
    });
    
    return y + boxHeight + 5;
  }

  generateCitasDetalladasReport(data, fechaDesde, fechaHasta) {
    this.createDocument();
    this.addHeader('Reporte de Citas Detalladas', 'Análisis completo de citas médicas');
    
    let y = 60;
    
    // Información del período
    if (fechaDesde && fechaHasta) {
      this.doc.setTextColor(...this.colors.text);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Período de Análisis:', 15, y);
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${fechaDesde} - ${fechaHasta}`, 50, y);
      y += 15;
    }
    
    // Verificar si hay datos
    if (!data || data.length === 0) {
      this.doc.setTextColor(...this.colors.text);
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('No hay datos disponibles', 15, y);
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('No se encontraron citas para el período seleccionado.', 15, y + 10);
      return this.addFooter().doc;
    }
    
    // Preparar datos para la tabla
    const headers = ['ID', 'Hospital', 'Médico', 'Paciente', 'Especialidad', 'Estado'];
    const tableData = data.slice(0, 25).map(item => [
      String(item.id || 'N/A'),
      String(item.hospital || 'N/A'),
      String(item.medico || 'N/A'),
      String(item.paciente || 'N/A'),
      String(item.especialidad || 'N/A'),
      String(item.estado || 'N/A')
    ]);
    
    // Crear tabla estilizada
    y = this.addStyledTable(headers, tableData, y);
    
    // Resumen estadístico
    const totalCitas = data.length;
    const atendidas = data.filter(item => item.estado === 'ATENDIDA').length;
    const canceladas = data.filter(item => item.estado === 'CANCELADA').length;
    const programadas = data.filter(item => item.estado === 'PROGRAMADA').length;
    
    const resumenItems = [
      `Total de citas: ${totalCitas}`,
      `Atendidas: ${atendidas} (${((atendidas/totalCitas)*100).toFixed(1)}%)`,
      `Canceladas: ${canceladas} (${((canceladas/totalCitas)*100).toFixed(1)}%)`,
      `Programadas: ${programadas} (${((programadas/totalCitas)*100).toFixed(1)}%)`
    ];
    
    y = this.addSummaryBox('Resumen Estadístico', resumenItems, y);

    return this.addFooter().doc;
  }

  generateResumenEspecialidadReport(data, fechaDesde, fechaHasta) {
    this.createDocument();
    this.addHeader('Resumen por Especialidad', 'Análisis de demanda por especialidad médica');
    
    let y = 60;
    
    // Información del período
    if (fechaDesde && fechaHasta) {
      this.doc.setTextColor(...this.colors.text);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Período de Análisis:', 15, y);
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${fechaDesde} - ${fechaHasta}`, 50, y);
      y += 15;
    }
    
    // Verificar si hay datos
    if (!data || data.length === 0) {
      this.doc.setTextColor(...this.colors.text);
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('No hay datos disponibles', 15, y);
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('No se encontraron especialidades para el período seleccionado.', 15, y + 10);
      return this.addFooter().doc;
    }
    
    // Preparar datos para la tabla
    const headers = ['Especialidad', 'Total', 'Atendidas', 'Canceladas', 'Programadas', '% Atención'];
    const tableData = data.map(item => [
      String(item.especialidad || 'N/A'),
      String(item.totalCitas || 0),
      String(item.atendidas || 0),
      String(item.canceladas || 0),
      String(item.programadas || 0),
      `${String(item.porcentajeAtencion || 0)}%`
    ]);
    
    // Crear tabla estilizada
    y = this.addStyledTable(headers, tableData, y);
    
    // Resumen estadístico
    const totalCitas = data.reduce((sum, item) => sum + (item.totalCitas || 0), 0);
    const totalAtendidas = data.reduce((sum, item) => sum + (item.atendidas || 0), 0);
    const totalCanceladas = data.reduce((sum, item) => sum + (item.canceladas || 0), 0);
    const totalProgramadas = data.reduce((sum, item) => sum + (item.programadas || 0), 0);
    const porcentajeAtencion = totalCitas > 0 ? ((totalAtendidas / totalCitas) * 100).toFixed(1) : 0;
    
    const resumenItems = [
      `Total de citas: ${totalCitas}`,
      `Citas atendidas: ${totalAtendidas} (${porcentajeAtencion}%)`,
      `Citas canceladas: ${totalCanceladas} (${((totalCanceladas/totalCitas)*100).toFixed(1)}%)`,
      `Citas programadas: ${totalProgramadas} (${((totalProgramadas/totalCitas)*100).toFixed(1)}%)`,
      `Especialidades analizadas: ${data.length}`
    ];
    
    y = this.addSummaryBox('Resumen General', resumenItems, y);
    
    // Top especialidades
    if (data.length > 0) {
      const topEspecialidades = data
        .sort((a, b) => (b.totalCitas || 0) - (a.totalCitas || 0))
        .slice(0, 3);
      
      const topItems = topEspecialidades.map((item, index) => 
        `${index + 1}. ${item.especialidad}: ${item.totalCitas} citas`
      );
      
      y = this.addSummaryBox('Top 3 Especialidades', topItems, y);
    }

    return this.addFooter().doc;
  }

  generateProductividadMedicoReport(data, fechaDesde, fechaHasta) {
    this.createDocument();
    this.addHeader('Productividad por Médico', 'Análisis de rendimiento del personal médico');
    
    let y = 60;
    
    // Información del período
    if (fechaDesde && fechaHasta) {
      this.doc.setTextColor(...this.colors.text);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Período de Análisis:', 15, y);
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${fechaDesde} - ${fechaHasta}`, 50, y);
      y += 15;
    }
    
    // Verificar si hay datos
    if (!data || data.length === 0) {
      this.doc.setTextColor(...this.colors.text);
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('No hay datos disponibles', 15, y);
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('No se encontraron médicos para el período seleccionado.', 15, y + 10);
      return this.addFooter().doc;
    }
    
    // Preparar datos para la tabla
    const headers = ['Médico', 'Especialidades', 'Total', 'Atendidas', 'Canceladas', 'Eficiencia'];
    const tableData = data.map(item => {
      const totalCitas = item.totalCitas || 0;
      const atendidas = item.atendidas || 0;
      const eficiencia = totalCitas > 0 ? ((atendidas / totalCitas) * 100).toFixed(1) : 0;
      
      return [
        String(item.medico || 'N/A'),
        String(item.especialidades || 'N/A'),
        String(totalCitas),
        String(atendidas),
        String(item.canceladas || 0),
        `${eficiencia}%`
      ];
    });
    
    // Crear tabla estilizada
    y = this.addStyledTable(headers, tableData, y);
    
    // Resumen estadístico
    const totalCitas = data.reduce((sum, item) => sum + (item.totalCitas || 0), 0);
    const totalAtendidas = data.reduce((sum, item) => sum + (item.atendidas || 0), 0);
    const totalCanceladas = data.reduce((sum, item) => sum + (item.canceladas || 0), 0);
    const eficienciaGeneral = totalCitas > 0 ? ((totalAtendidas / totalCitas) * 100).toFixed(1) : 0;
    
    const resumenItems = [
      `Total de médicos: ${data.length}`,
      `Total de citas: ${totalCitas}`,
      `Citas atendidas: ${totalAtendidas} (${eficienciaGeneral}%)`,
      `Citas canceladas: ${totalCanceladas} (${((totalCanceladas/totalCitas)*100).toFixed(1)}%)`,
      `Promedio de citas por médico: ${(totalCitas / data.length).toFixed(1)}`
    ];
    
    y = this.addSummaryBox('Resumen General', resumenItems, y);
    
    // Top médicos
    if (data.length > 0) {
      const topMedicos = data
        .sort((a, b) => (b.totalCitas || 0) - (a.totalCitas || 0))
        .slice(0, 3);
      
      const topItems = topMedicos.map((item, index) => {
        const eficiencia = (item.totalCitas || 0) > 0 ? 
          (((item.atendidas || 0) / (item.totalCitas || 1)) * 100).toFixed(1) : 0;
        return `${index + 1}. ${item.medico}: ${item.totalCitas} citas (${eficiencia}% eficiencia)`;
      });
      
      y = this.addSummaryBox('Top 3 Médicos', topItems, y);
      
      // Médico más eficiente
      const medicoEficiente = data.reduce((best, current) => {
        const bestEficiencia = (best.totalCitas || 0) > 0 ? 
          ((best.atendidas || 0) / (best.totalCitas || 1)) * 100 : 0;
        const currentEficiencia = (current.totalCitas || 0) > 0 ? 
          ((current.atendidas || 0) / (current.totalCitas || 1)) * 100 : 0;
        return currentEficiencia > bestEficiencia ? current : best;
      });
      
      const eficienciaMax = (medicoEficiente.totalCitas || 0) > 0 ? 
        (((medicoEficiente.atendidas || 0) / (medicoEficiente.totalCitas || 1)) * 100).toFixed(1) : 0;
      
      const destacadosItems = [
        `Médico más productivo: ${medicoEficiente.medico} (${medicoEficiente.totalCitas} citas)`,
        `Médico más eficiente: ${medicoEficiente.medico} (${eficienciaMax}% de eficiencia)`
      ];
      
      y = this.addSummaryBox('Destacados', destacadosItems, y);
    }

    return this.addFooter().doc;
  }
}

module.exports = PDFGeneratorService;