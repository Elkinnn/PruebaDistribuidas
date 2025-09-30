/**
 * Utilidades para validar solapamiento de horarios de citas
 */

/**
 * Verifica si dos intervalos de tiempo se solapan
 * @param {Date} start1 - Inicio del primer intervalo
 * @param {Date} end1 - Fin del primer intervalo
 * @param {Date} start2 - Inicio del segundo intervalo
 * @param {Date} end2 - Fin del segundo intervalo
 * @returns {boolean} - true si se solapan, false si no
 */
export function intervalsOverlap(start1, end1, start2, end2) {
  // Dos intervalos se solapan si:
  // start1 < end2 AND start2 < end1
  return start1 < end2 && start2 < end1;
}

/**
 * Verifica si un nuevo horario se solapa con citas existentes
 * @param {Date} newStart - Inicio del nuevo horario
 * @param {Date} newEnd - Fin del nuevo horario
 * @param {Array} existingCitas - Array de citas existentes
 * @param {string} excludeId - ID de cita a excluir (para edición)
 * @returns {Object} - { hasOverlap: boolean, conflictingCita: Object|null }
 */
export function checkScheduleOverlap(newStart, newEnd, existingCitas, excludeId = null) {
  // Filtrar citas programadas y excluir la cita que se está editando
  const programadas = existingCitas.filter(cita => 
    cita.estado === 'PROGRAMADA' && 
    cita.id !== excludeId
  );

  for (const cita of programadas) {
    const citaStart = new Date(cita.inicio || cita.fechaInicio);
    const citaEnd = new Date(cita.fin || cita.fechaFin);

    if (intervalsOverlap(newStart, newEnd, citaStart, citaEnd)) {
      return {
        hasOverlap: true,
        conflictingCita: cita
      };
    }
  }

  return {
    hasOverlap: false,
    conflictingCita: null
  };
}

/**
 * Formatea fechas para mostrar en mensajes de error
 * @param {Date} date - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export function formatDateTime(date) {
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Genera mensaje de error detallado para solapamiento
 * @param {Object} conflict - Resultado de checkScheduleOverlap
 * @param {Date} newStart - Inicio del nuevo horario
 * @param {Date} newEnd - Fin del nuevo horario
 * @returns {string} - Mensaje de error
 */
export function generateOverlapMessage(conflict, newStart, newEnd) {
  if (!conflict.hasOverlap) return null;

  return "Ya existe una cita en este horario. Selecciona otro horario.";
}
