const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { createProxyConfig, createFileProxyConfig } = require('../middleware/proxy');
const config = require('../config');
const http = require('../http');
const { getBreaker } = require('../resilience/circuitBreaker');
const router = express.Router();

const RETRYABLE_METHODS = new Set(['GET', 'HEAD']);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) => {
  if (!error) return false;

  // Errores de servidor (5xx) son retryable
  if (error.response && error.response.status >= 500) {
    return true;
  }

  // Errores de timeout de axios
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return true;
  }

  // Errores de conexión
  const code = error.code ? String(error.code).toUpperCase() : undefined;
  const transientCodes = new Set(['ECONNRESET', 'ECONNABORTED', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED']);

  if (code && transientCodes.has(code)) {
    return true;
  }

  // Detectar timeouts en el mensaje de error
  const errorMsg = (error.message || '').toLowerCase();
  if (errorMsg.includes('timeout') || errorMsg.includes('timed out') || errorMsg.includes('exceeded')) {
    return true;
  }

  // Si no hay respuesta del servidor (conexión fallida), es retryable
  if (!error.response && (error.code || error.message)) {
    return true;
  }

  return false;
};

const shouldRetry = (method) => {
  if (!config.resilience.enabled) return false;
  if (!config.resilience.retry.enabled) return false;
  return RETRYABLE_METHODS.has(String(method || '').toUpperCase());
};

const performRequest = async (requestConfig, method, serviceName) => {
  const normalizedMethod = String(method || requestConfig.method || 'GET').toUpperCase();
  const maxAttempts = Math.max(1, config.resilience.retry.maxAttempts);
  const retryable = shouldRetry(normalizedMethod);

  // Circuit Breaker
  const svc = serviceName || 'default';
  const cb = getBreaker(svc, {
    windowMs: Number(process.env.CB_WINDOW_MS ?? 30000),
    thresholdPercent: Number(process.env.CB_THRESHOLD_PERCENT ?? 50),
    halfOpenAfterMs: Number(process.env.CB_HALF_OPEN_AFTER_MS ?? 20000),
  });

  // Log de entrada (siempre mostrar para debugging)
  console.log(`[CB] ${svc}: performRequest iniciado (resilience: ${config.resilience.enabled}, method: ${normalizedMethod}, retryable: ${retryable}, maxAttempts: ${maxAttempts})`);

  if (!cb.canPass()) {
    const e = new Error('Circuit open');
    e.isCircuitOpen = true;
    e.response = { status: 503, data: { error: 'CIRCUIT_OPEN', message: 'Temporalmente no disponible' } };
    throw e;
  }

  let attempt = 0;
  let lastError;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      const resp = await http({
        ...requestConfig,
        method: normalizedMethod
      });
      // Éxito: registrar éxito en circuit breaker
      cb.record(true);
      return resp;
    } catch (error) {
      lastError = error;
      const isRetryable = isRetryableError(error);
      const isLastAttempt = attempt >= maxAttempts;

      // Log para debugging
      if (config.resilience.enabled) {
        console.log(`[CB] ${svc}: Error capturado (attempt ${attempt}/${maxAttempts}): code=${error.code}, message=${error.message?.substring(0, 50)}, isRetryable=${isRetryable}, retryable=${retryable}`);
      }

      // Si no es retryable o es el último intento, registrar fallo y lanzar error
      if (!retryable || !isRetryable || isLastAttempt) {
        cb.record(false);
        const cbState = cb.state();
        if (config.resilience.enabled) {
          console.log(`[CB] ${svc}: Fallo registrado (attempt ${attempt}/${maxAttempts}, retryable: ${isRetryable}, state: ${cbState})`);
        }
        throw error;
      }

      // Si es retryable y hay más intentos, hacer retry con backoff
      const backoff = config.resilience.retry.baseDelayMs * Math.pow(2, attempt - 1);
      if (config.resilience.enabled) {
        console.log(`[CB] ${svc}: Retry ${attempt}/${maxAttempts} después de ${backoff}ms`);
      }
      await sleep(backoff);
    }
  }

  // Esto no debería ejecutarse, pero por seguridad
  if (lastError) {
    cb.record(false);
    throw lastError;
  }
  throw new Error('Unexpected error: no error recorded');
};

// Proxy personalizado para admin-service con Circuit Breaker
// Reemplaza http-proxy-middleware para tener protección completa
router.use('/admin', async (req, res) => {
  try {
    // Remover /admin del path antes de enviarlo al servicio
    const servicePath = req.url.replace(/^\/admin/, '') || '/';
    console.log(`[ADMIN PROXY] ${req.method} ${req.url} -> ${config.services.admin}${servicePath}`);
    
    const requestConfig = {
      method: req.method,
      url: `${config.services.admin}${servicePath}`,
      headers: {
        ...req.headers
      }
    };
    
    // Agregar body si existe
    if (req.body && Object.keys(req.body).length > 0) {
      requestConfig.data = req.body;
    }
    
    // Para rutas de reportes (PDFs), usar responseType arraybuffer
    if (req.url.includes('/reportes/') || req.url.includes('/reportes')) {
      requestConfig.responseType = 'arraybuffer';
    }
    
    const response = await performRequest(requestConfig, req.method, 'admin-service');
    
    // Manejar PDFs y otros archivos binarios
    if (req.url.includes('/reportes/') || req.url.includes('/reportes') || 
        response.headers['content-type']?.includes('application/pdf') ||
        response.headers['content-type']?.includes('application/octet-stream')) {
      // Copiar headers relevantes
      Object.keys(response.headers).forEach(key => {
        if (key.toLowerCase() !== 'content-encoding') {
          res.setHeader(key, response.headers[key]);
        }
      });
      res.status(response.status).send(response.data);
    } else {
      // Para JSON normal
      res.status(response.status).json(response.data);
    }
    
    console.log(`[ADMIN PROXY RESPONSE] ${req.method} ${req.url} -> ${response.status}`);
  } catch (error) {
    console.error(`[ADMIN PROXY ERROR] ${req.method} ${req.url}:`, error.message);
    if (error.isCircuitOpen && error.response) {
      console.error(`[ADMIN PROXY ERROR] Circuit Breaker abierto`);
      res.status(error.response.status).json(error.response.data);
    } else if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error(`[ADMIN PROXY ERROR] Conexión rechazada - servicio no disponible`);
      res.status(502).json({
        error: 'SERVICE_UNAVAILABLE',
        message: 'El servicio admin no está disponible'
      });
    } else {
      res.status(502).json({
        error: 'UPSTREAM_UNAVAILABLE',
        message: 'Servicio backend no disponible'
      });
    }
  }
});

// Proxy personalizado para médico-service usando el cliente HTTP compartido
if (config.services.medico) {
  console.log(`[GATEWAY] Configurando proxy para médico-service: ${config.services.medico}`);
  
  router.use('/medico', async (req, res) => {
    try {
      // Reconstruir la ruta completa con /medico
      const fullPath = `/medico${req.url}`;
      console.log(`[MEDICO PROXY] ${req.method} ${req.url} -> ${config.services.medico}${fullPath}`);
      
      const requestConfig = {
        method: req.method,
        url: `${config.services.medico}${fullPath}`,
        headers: {
          ...req.headers
        }
      };
      
      // Agregar body si existe
      if (req.body && Object.keys(req.body).length > 0) {
        requestConfig.data = req.body;
        console.log(`[MEDICO PROXY] Body enviado:`, req.body);
      }
      
      console.log(`[MEDICO PROXY] Enviando request:`, requestConfig.method, requestConfig.url);
      console.log(`[MEDICO PROXY] Headers:`, requestConfig.headers);
      
      const response = await performRequest(requestConfig, req.method, 'medico-service');
      res.status(response.status).json(response.data);
      
      console.log(`[MEDICO PROXY RESPONSE] ${req.method} ${req.url} -> ${response.status}`);
    } catch (error) {
      console.error(`[MEDICO PROXY ERROR] ${req.method} ${req.url}:`, error.message);
      if (error.isCircuitOpen && error.response) {
        console.error(`[MEDICO PROXY ERROR] Circuit Breaker abierto`);
        res.status(error.response.status).json(error.response.data);
      } else if (error.response) {
        console.error(`[MEDICO PROXY ERROR] Response status: ${error.response.status}`);
        console.error(`[MEDICO PROXY ERROR] Response headers:`, error.response.headers);
        console.error(`[MEDICO PROXY ERROR] Response data:`, error.response.data);
        res.status(error.response.status).json(error.response.data);
      } else if (error.code === 'ECONNREFUSED') {
        console.error(`[MEDICO PROXY ERROR] Conexión rechazada - servicio no disponible`);
        res.status(502).json({
          error: 'SERVICE_UNAVAILABLE',
          message: 'El servicio de médico no está disponible'
        });
      } else {
        console.error(`[MEDICO PROXY ERROR] Error desconocido:`, error);
        res.status(502).json({
          error: 'PROXY_ERROR',
          message: 'Error de conexión con el servicio de médico'
        });
      }
    }
  });
} else {
  console.log(`[GATEWAY] No se configuró proxy para médico-service`);
}

// Proxy de compatibilidad para rutas legacy (sin namespacing)
// Usando el cliente HTTP como fallback para garantizar compatibilidad
const createAxiosProxy = (servicePath) => {
  return async (req, res) => {
    try {
      console.log(`[PROXY] ${req.method} ${req.url} -> ${config.services.admin}${servicePath}${req.url}`);
      
      const requestConfig = {
        method: req.method,
        url: `${config.services.admin}${servicePath}${req.url}`,
        headers: {
          ...req.headers
        }
      };
      
      // Agregar body si existe
      if (req.body && Object.keys(req.body).length > 0) {
        requestConfig.data = req.body;
      }
      
      // Para rutas de reportes (PDFs), usar responseType arraybuffer
      if (req.url.includes('/reportes/')) {
        requestConfig.responseType = 'arraybuffer';
      }
      
      console.log(`[PROXY] Llamando performRequest para ${req.method} ${req.url}`);
      const response = await performRequest(requestConfig, req.method, 'admin-service');
      console.log(`[PROXY] performRequest completado para ${req.method} ${req.url}`);
      
      // Manejar PDFs
      if (req.url.includes('/reportes/')) {
        Object.keys(response.headers).forEach(key => {
          if (key.toLowerCase() !== 'content-encoding') {
            res.setHeader(key, response.headers[key]);
          }
        });
        res.status(response.status).send(response.data);
      } else {
        // Para JSON normal
        res.status(response.status).json(response.data);
      }
      
      console.log(`[PROXY RESPONSE] ${req.method} ${req.url} -> ${response.status}`);
    } catch (error) {
      console.error(`[PROXY ERROR] ${req.method} ${req.url}:`, error.message);
      if (error.isCircuitOpen && error.response) {
        console.error(`[PROXY ERROR] Circuit Breaker abierto`);
        res.status(error.response.status).json(error.response.data);
      } else if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(502).json({
          error: 'UPSTREAM_UNAVAILABLE',
          message: 'Servicio backend no disponible'
        });
      }
    }
  };
};

// Proxies de compatibilidad usando axios
router.use('/especialidades', createAxiosProxy('/especialidades'));
router.use('/hospitales', createAxiosProxy('/hospitales'));
router.use('/medicos', createAxiosProxy('/medicos'));
router.use('/empleados', createAxiosProxy('/empleados'));
router.use('/medico-especialidades', createAxiosProxy('/medico-especialidades'));
router.use('/citas', createAxiosProxy('/citas'));

module.exports = router;