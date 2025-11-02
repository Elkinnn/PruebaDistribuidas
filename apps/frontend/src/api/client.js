import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000, // 12s (mayor que 4s del gateway para permitir que el 503 llegue antes)
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor para manejar errores globales
apiClient.interceptors.response.use(
  (response) => {
    // Detectar si la respuesta viene de cache stale
    if (response.headers?.['x-data-source'] === 'stale-cache' || response.data?._stale === true) {
      // Marcar respuesta como stale para que la UI lo maneje
      response.data = { ...response.data, _stale: true };
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('authToken')
      localStorage.removeItem('clinix_user')
      window.location.href = '/admin/login'
      return Promise.reject(error)
    }
    
    // Extraer información del error de forma robusta
    const status = error?.response?.status ?? error?.status ?? 0;
    const data = error?.response?.data ?? {};
    const isTimeout = error?.code === 'ECONNABORTED' || error?.message?.includes('timeout');
    const isCircuitOpen = error?.response?.headers?.['x-cb-state'] === 'OPEN' || 
                         error?.isCircuitOpen || 
                         status === 503;

    // Normalizar error para la UI
    const normalized = {
      status: status,
      code: data?.error || (isCircuitOpen ? 'CIRCUIT_OPEN' : isTimeout ? 'TIMEOUT' : 'REQUEST_ERROR'),
      message: data?.message || 
               (isCircuitOpen ? 'El servicio está temporalmente no disponible. Por favor, intenta nuevamente en unos momentos.' :
                isTimeout ? 'Tiempo de espera agotado' : 'No se pudo completar la solicitud'),
      service: data?.service,
      correlationId: data?.correlationId,
      stale: data?._stale === true || error?.response?.headers?.['x-data-source'] === 'stale-cache',
      isCircuitOpen: isCircuitOpen
    };

    // Para endpoints de catálogos/listas (hospitales, medicos, especialidades, citas, empleados, kpis, etc.),
    // cuando 503/timeout => retornar un objeto "vacío" consumible por la UI en vez de lanzar.
    // Así evitas "Uncaught (in promise)" y la UI muestra placeholders.
    const isCatalogGet = error?.config?.method?.toUpperCase() === 'GET' &&
      /\/(hospitales|medicos|especialidades|citas|empleados|kpis|graficas)/.test(error?.config?.url || '');

    if (isCatalogGet && (isTimeout || status === 503 || isCircuitOpen)) {
      // Retornar fallback vacío con flag "degraded"
      return Promise.resolve({
        data: {
          items: [],
          data: [],
          total: 0,
          degraded: true,
          _stale: normalized.stale,
          _error: normalized
        },
        status: 200,
        headers: { 'x-ui-fallback': 'empty' },
        config: error.config
      });
    }

    // Para el resto, rechazar con error normalizado para que cada pantalla decida.
    error.normalized = normalized;
    return Promise.reject(error);
  }
)

export default apiClient
