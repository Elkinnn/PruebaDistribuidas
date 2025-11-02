import axios from 'axios'

// FORZAR LOG INMEDIATO - Debe aparecer SIEMPRE
if (typeof window !== 'undefined') {
  window.__CB_DEBUG__ = true;
  console.error('🔴 [CB DEBUG] client.js se está cargando AHORA');
  console.error('🔴 [CB DEBUG] Timestamp:', new Date().toISOString());
}

// Verificar que axios esté disponible
if (!axios || typeof axios.create !== 'function') {
  console.error('[CB] ERROR: axios no está disponible correctamente', {
    hasAxios: !!axios,
    axiosType: typeof axios,
    hasCreate: !!(axios && typeof axios.create === 'function')
  });
  throw new Error('axios no está disponible correctamente');
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

// Variable para almacenar la función de notificación (se establecerá dinámicamente)
let notifyCircuitBreakerState = null;

// Función para registrar el notificador (será llamado desde el contexto cuando esté listo)
export function registerCircuitBreakerNotifier(notifier) {
  notifyCircuitBreakerState = notifier;
  console.log('[CB] Notificador registrado:', typeof notifier);
}

// Función wrapper para notificar (maneja el caso donde aún no está registrado)
function notifyCB(isOpen, error = null) {
  if (notifyCircuitBreakerState) {
    notifyCircuitBreakerState(isOpen, error);
  } else {
    console.warn('[CB] Notificador aún no está registrado, estado:', { isOpen, error });
    // Guardar el estado para cuando se registre
    if (typeof window !== 'undefined') {
      window.__CB_PENDING_STATE__ = { isOpen, error };
    }
  }
}

console.log('[CB] Módulo client.js cargado');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000, // 12s (mayor que 4s del gateway para permitir que el 503 llegue antes)
  headers: {
    'Content-Type': 'application/json',
  },
  // Asegurar que axios trate los 5xx como errores
  validateStatus: function (status) {
    // Solo considerar 2xx como éxito, todo lo demás va al interceptor de error
    return status >= 200 && status < 300;
  }
})

console.log('[CB] Cliente API creado, baseURL:', API_BASE_URL);

// Verificar que apiClient tenga interceptors antes de usarlos
console.log('[CB] Verificando apiClient:', {
  hasApiClient: !!apiClient,
  apiClientType: typeof apiClient,
  hasInterceptors: !!(apiClient && apiClient.interceptors),
  hasRequest: !!(apiClient && apiClient.interceptors && apiClient.interceptors.request),
  requestType: apiClient?.interceptors?.request ? typeof apiClient.interceptors.request : 'undefined',
  useType: apiClient?.interceptors?.request?.use ? typeof apiClient.interceptors.request.use : 'undefined'
});

if (!apiClient || !apiClient.interceptors || !apiClient.interceptors.request) {
  console.error('[CB] ERROR: apiClient.interceptors no disponible', {
    hasApiClient: !!apiClient,
    hasInterceptors: !!(apiClient && apiClient.interceptors),
    hasRequest: !!(apiClient && apiClient.interceptors && apiClient.interceptors.request),
    apiClientType: typeof apiClient,
    apiClientKeys: apiClient ? Object.keys(apiClient) : []
  });
  throw new Error('apiClient.interceptors.request no está disponible');
}

// Request interceptor para agregar token de autenticación
try {
  console.log('[CB] Intentando registrar request interceptor...');
  
  // Verificación adicional antes de usar
  if (typeof apiClient.interceptors.request.use !== 'function') {
    throw new Error(`apiClient.interceptors.request.use no es una función. Tipo: ${typeof apiClient.interceptors.request.use}`);
  }
  
  const requestInterceptorId = apiClient.interceptors.request.use(
    function requestInterceptor(config) {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    function requestErrorHandler(error) {
      return Promise.reject(error)
    }
  );
  console.log('[CB] Request interceptor registrado correctamente con ID:', requestInterceptorId);
} catch (error) {
  console.error('[CB] ERROR al registrar request interceptor:', error);
  console.error('[CB] Error details:', {
    message: error.message,
    stack: error.stack,
    apiClientExists: !!apiClient,
    hasInterceptors: !!(apiClient && apiClient.interceptors),
    hasRequest: !!(apiClient && apiClient.interceptors && apiClient.interceptors.request),
    useIsFunction: !!(apiClient && apiClient.interceptors && apiClient.interceptors.request && typeof apiClient.interceptors.request.use === 'function'),
    requestUseType: apiClient?.interceptors?.request?.use ? typeof apiClient.interceptors.request.use : 'undefined'
  });
  // No lanzar el error, solo loguearlo para que la app pueda seguir funcionando
  // El script inline seguirá funcionando independientemente
  console.warn('[CB] Continuando sin request interceptor (el script inline seguirá funcionando)');
}

// MONITOREO GLOBAL DE ERRORES 503  
// Este código se ejecuta inmediatamente sin esperar a que se registre el interceptor
(function setupGlobal503Monitor() {
  console.error('🔴 [CB SETUP] Configurando monitor global de 503...');
  console.error('🔴 [CB SETUP] window disponible:', typeof window !== 'undefined');
})();

// Response interceptor para manejar errores globales
console.log('[CB] Registrando interceptor de respuesta...');

// Verificar que apiClient tenga interceptors.response antes de usarlo
if (!apiClient || !apiClient.interceptors || !apiClient.interceptors.response) {
  console.error('[CB] ERROR: apiClient.interceptors.response no disponible');
  throw new Error('apiClient.interceptors.response no está disponible');
}

let responseInterceptor;
try {
  responseInterceptor = apiClient.interceptors.response.use(
  (response) => {
    // Detectar si la respuesta viene de cache stale
    if (response.headers?.['x-data-source'] === 'stale-cache' || response.data?._stale === true) {
      // Marcar respuesta como stale para que la UI lo maneje
      response.data = { ...response.data, _stale: true };
    }
    
    // Si hay una respuesta exitosa (2xx) y es del servicio de admin, notificar que está disponible
    const url = response.config?.url || response.config?.baseURL || '';
    const baseURL = response.config?.baseURL || API_BASE_URL || '';
    
    // Es admin si NO contiene rutas de médico
    const isAdminService = !url.includes('/medico/') && 
                           !url.match(/\/medico[\/\?]/) &&
                           !baseURL.includes('medico') &&
                           !baseURL.includes('/medico');
    
    if (response.status >= 200 && response.status < 300 && isAdminService) {
      console.log('[CB] Respuesta exitosa - servicio disponible', { 
        status: response.status, 
        url: url.substring(0, 100), 
        baseURL: baseURL.substring(0, 100),
        isAdminService 
      });
      notifyCB(false, null);
    }
    
    return response;
  },
  (error) => {
    // LOG INMEDIATO al entrar en el interceptor de error
    console.log('[CB INTERCEPTOR] Error capturado:', {
      hasResponse: !!error.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      code: error?.code,
      message: error?.message,
      url: error?.config?.url,
      method: error?.config?.method
    });

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

    // Detectar si es del servicio de administración
    // El cliente API está configurado para admin (puerto 3002 = gateway que hace proxy a admin)
    const url = error?.config?.url || error?.config?.baseURL || '';
    const baseURL = error?.config?.baseURL || API_BASE_URL || '';
    
    // Es admin si NO contiene rutas de médico
    // El cliente principal (apiClient) es para admin, solo client.medico.js es para médico
    const isAdminService = !url.includes('/medico/') && 
                           !url.match(/\/medico[\/\?]/) &&
                           !baseURL.includes('medico') &&
                           !baseURL.includes('/medico');
    
    console.log('[CB] Verificando error:', { 
      status, 
      isCircuitOpen, 
      url: url.substring(0, 100), 
      baseURL: baseURL.substring(0, 100),
      isAdminService 
    });

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

    // Notificar al contexto cuando el circuit breaker se abre o cierra
    // IMPORTANTE: Esto debe hacerse ANTES de retornar fallbacks
    if (isCircuitOpen && isAdminService) {
      console.error('🔴 [CB] Circuit breaker abierto detectado - notificando', { status, url, isAdminService });
      
      const errorInfo = {
        status,
        code: data?.error || 'CIRCUIT_OPEN',
        message: data?.message || 'El servicio de administración está temporalmente no disponible',
        service: data?.service || 'admin-service'
      };
      
      // Notificar vía función
      notifyCB(true, errorInfo);
      
      // También notificar vía evento y window para asegurar que llegue
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('circuit-breaker-state-change', {
          detail: { isOpen: true, error: errorInfo }
        }));
        window.__CB_GLOBAL_STATE__ = { isOpen: true, error: errorInfo };
        console.error('🔴 [CB] Notificación enviada por múltiples vías');
      }
    } else if (status !== 503 && !isCircuitOpen && isAdminService) {
      // Si no es un error 503 y no es circuit open, el servicio está disponible
      console.log('[CB] Servicio disponible - notificando', { status, url, isAdminService });
      notifyCB(false, null);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('circuit-breaker-state-change', {
          detail: { isOpen: false, error: null }
        }));
        window.__CB_GLOBAL_STATE__ = { isOpen: false, error: null };
      }
    }

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
  },
  // Segundo parámetro para errores de red (fuera del response)
  (error) => {
    console.log('[CB INTERCEPTOR] Error de red/fuera de response:', error);
    // Si es un error de red sin response, también puede ser circuit breaker
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      const url = error?.config?.url || error?.config?.baseURL || '';
      const baseURL = error?.config?.baseURL || API_BASE_URL || '';
      const isAdminService = !url.includes('/medico/') && 
                             !url.match(/\/medico[\/\?]/) &&
                             !baseURL.includes('medico');
      
      if (isAdminService) {
        console.log('[CB] Timeout/red detectado - notificando circuit breaker abierto');
        notifyCB(true, {
          status: 503,
          code: 'SERVICE_UNAVAILABLE',
          message: 'El servicio de administración no responde. Verificando estado...',
          service: 'admin-service'
        });
      }
    }
    return Promise.reject(error);
  }
  );
  console.log('[CB] Response interceptor registrado correctamente con ID:', responseInterceptor);
} catch (error) {
  console.error('[CB] ERROR al registrar response interceptor:', error);
  throw error;
}

export default apiClient
