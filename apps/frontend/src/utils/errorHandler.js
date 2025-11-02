/**
 * Maneja errores de la API, especialmente errores del Circuit Breaker (503)
 * @param {Error} error - El error capturado
 * @returns {string} - Mensaje de error amigable para el usuario
 */
export function getErrorMessage(error) {
  // Manejar Circuit Breaker específicamente
  if (error.status === 503 || error.isCircuitOpen) {
    return "El servicio está temporalmente no disponible. Por favor, intenta nuevamente en unos momentos.";
  }
  
  if (error.response?.status === 503) {
    return error.response?.data?.message || 
           "El servicio está temporalmente no disponible. Por favor, intenta nuevamente en unos momentos.";
  }
  
  // Errores específicos del backend
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return "Error al procesar la solicitud. Por favor, intenta nuevamente.";
}

/**
 * Crea un objeto de notificación de error
 * @param {Error} error - El error capturado
 * @param {string} defaultMessage - Mensaje por defecto si no se puede extraer uno específico
 * @returns {Object} - Objeto de notificación listo para usar
 */
export function createErrorNotification(error, defaultMessage = "Error al procesar la solicitud") {
  const message = getErrorMessage(error);
  
  return {
    open: true,
    type: "error",
    title: "Error",
    message: message || defaultMessage,
    duration: 6000
  };
}

