const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { createProxyConfig, createFileProxyConfig } = require('../middleware/proxy');
const config = require('../config');
const http = require('../http');
const { getBreaker } = require('../resilience/circuitBreaker');
const { buildCacheKey, cacheGet, cacheSet } = require('../cache/simpleCache');
const crypto = require('crypto');
const router = express.Router();

const RETRYABLE_METHODS = new Set(['GET', 'HEAD']);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// A) Normalización de errores - siempre retorna Error con name, message, code, status
function normalizeError(err) {
  // Caso: null, undefined, o valor primitivo inválido
  if (!err) {
    const e = new Error('unknown_error');
    e.code = 'UNKNOWN';
    e.status = 503;
    e.name = 'Error';
    return e;
  }
  
  // Si ya es Error, copiar propiedades
  if (err instanceof Error) {
    const e = new Error(String(err.message || err.toString() || 'unknown_error'));
    e.name = err.name || 'Error';
    e.code = err.code || err.response?.data?.error || err.response?.status?.toString() || 'UNKNOWN';
    e.status = err.status || err.response?.status || (err.code === 'ECONNABORTED' ? 408 : 503);
    e.response = err.response;
    e.isCircuitOpen = err.isCircuitOpen;
    e.cbState = err.cbState;
    return e;
  }
  
  // Si es string
  if (typeof err === 'string') {
    const e = new Error(err || 'unknown_error');
    e.code = 'ERROR';
    e.status = 503;
    e.name = 'Error';
    return e;
  }
  
  // Si es número (status code)
  if (typeof err === 'number') {
    const e = new Error(`HTTP ${err}`);
    e.code = 'HTTP_ERROR';
    e.status = err;
    e.name = 'Error';
    return e;
  }
  
  // Si es objeto (incluso si no tiene message)
  if (typeof err === 'object') {
    const message = err.message || err.msg || err.error || err.toString?.() || 'unknown_error';
    const e = new Error(String(message));
    e.name = err.name || 'Error';
    e.code = err.code || err.response?.data?.error || err.response?.status?.toString() || 'UNKNOWN';
    e.status = err.status || err.response?.status || (err.code === 'ECONNABORTED' ? 408 : 503);
    e.response = err.response;
    e.isCircuitOpen = err.isCircuitOpen;
    e.cbState = err.cbState;
    return e;
  }
  
  // Fallback final
  const e = new Error('unknown_error');
  e.code = 'UNKNOWN';
  e.status = 503;
  e.name = 'Error';
  return e;
}

// A) Logging de errores en una línea
function logProxyError(req, serviceName, err) {
  try {
    const normalized = normalizeError(err);
    const url = req?.originalUrl || req?.url || 'unknown';
    const method = req?.method || 'UNKNOWN';
    const status = normalized.status ?? 503;
    const code = normalized.code ?? 'UNKNOWN';
    const message = normalized.message ?? 'unknown_error';
    console.error(
      `[PROXY ERROR] ${method} ${url} -> ${serviceName} | status=${status} | code=${code} | msg=${message}`
    );
  } catch (logErr) {
    // Si incluso el logging falla, usar console.error básico
    console.error(`[PROXY ERROR] Failed to log error:`, logErr);
    console.error(`[PROXY ERROR] Original error:`, err);
  }
}

// Helpers para clasificación de errores
const isRetryableStatus = (status) => {
  return status >= 500 || status === 408 || status === 429;
};

const isProbePath = (path) => {
  const normalizedPath = path || '';
  return normalizedPath.startsWith('/health') || 
         normalizedPath.startsWith('/db/health') || 
         normalizedPath.startsWith('/ready');
};

const isNetworkOrTimeout = (err) => {
  if (!err) return false;
  return err.code === 'ECONNABORTED' || // timeout axios
         err.code === 'ECONNREFUSED' ||
         err.code === 'ECONNRESET' ||
         err.code === 'EAI_AGAIN' ||
         err.message?.includes('timeout');
};

// Helper legacy para compatibilidad
const isRetryableError = (error) => {
  if (!error) return false;
  
  // Si hay respuesta, verificar status
  if (error.response) {
    return isRetryableStatus(error.response.status);
  }
  
  // Verificar errores de red/timeout
  return isNetworkOrTimeout(error);
};

const shouldRetry = (method) => {
  if (!config.resilience.enabled) return false;
  if (!config.resilience.retry.enabled) return false;
  return RETRYABLE_METHODS.has(String(method || '').toUpperCase());
};

const performRequest = async (requestConfig, method, serviceName, reqPath = null) => {
  const normalizedMethod = String(method || requestConfig.method || 'GET').toUpperCase();
  const maxAttempts = Math.max(1, config.resilience.retry.maxAttempts);
  const retryable = shouldRetry(normalizedMethod);

  // Circuit Breaker con configuración mejorada
  const svc = serviceName || 'default';
  
  // C) Solo cuentan como fallo: timeout, errores de conexión y 5xx (no 4xx)
  const isFailure = (err) => {
    const status = err?.response?.status;
    if (err?.code === 'ECONNABORTED') return true; // timeout
    if (['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN'].includes(err?.code)) return true;
    if (typeof status === 'number' && status >= 500) return true;
    return false; // 4xx NO cuenta como fallo
  };
  
  const cb = getBreaker(svc, {
    windowMs: Number(process.env.CB_WINDOW_MS ?? 60000), // 60s
    thresholdPercent: Number(process.env.CB_THRESHOLD_PERCENT ?? 50), // 50%
    halfOpenAfterMs: Number(process.env.CB_HALF_OPEN_AFTER_MS ?? 15000), // 15s
    minRequests: Number(process.env.CB_MIN_REQUESTS ?? 20), // 20 muestras mínimas
    isFailure,
  });

  const cbState = cb.state();
  const isCircuitOpen = cbState === 'OPEN';

  // Construir clave de caché (solo para GET)
  const cacheKey = normalizedMethod === 'GET' 
    ? buildCacheKey(svc, normalizedMethod, requestConfig.url) 
    : null;

  if (!cb.canPass()) {
    // Intentar servir stale cache si Circuit Breaker está abierto y es GET
    if (cacheKey && normalizedMethod === 'GET') {
      const cached = cacheGet(cacheKey);
      if (cached && cached.isStale) {
        // Servir cache stale
        const staleResponse = {
          status: 200,
          data: { ...cached.value.data, _stale: true },
          headers: { ...cached.value.headers, 'x-data-source': 'stale-cache' },
          fromCache: true
        };
        return staleResponse;
      }
    }

    // Reemplazar throw 'Circuit open' por Error normalizado
    const e = new Error('Circuit open');
    e.code = 'CIRCUIT_OPEN';
    e.status = 503;
    e.isCircuitOpen = true;
    e.cbState = cbState;
    throw e;
  }

  let attempt = 0;
  let lastError;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      // Request con validateStatus: () => true para clasificación manual
      // D) Timeout del gateway (4000ms) ya configurado en http.js
      const response = await http({
        ...requestConfig,
        method: normalizedMethod,
        validateStatus: () => true
        // timeout ya está en http.js (4000ms) - no reescribir aquí
      });

      const status = response.status;

      // No contaminar estadísticas del CB con probes
      if (reqPath && isProbePath(reqPath)) {
        cb.record(true); // Registrar éxito para "curar" más rápido
        return response;
      }

      // Clasificación por status - usar isFailure para determinar si cuenta como fallo
      const errorObj = status >= 500 ? { response: { status } } : null;
      if (isRetryableStatus(status)) {
        if (config.resilience.enabled) {
          console.log(`[CB] ${svc}: status=${status} retryable=true path=${reqPath || 'unknown'}`);
        }
        cb.record(false, errorObj);
      } else {
        // 2xx/3xx/4xx normales (400-499 excepto 408/429) NO abren CB
        if (config.resilience.enabled) {
          console.log(`[CB] ${svc}: status=${status} retryable=false path=${reqPath || 'unknown'}`);
        }
        cb.record(true, null);
        
        // Guardar en caché si es GET y 2xx
        if (cacheKey && status >= 200 && status < 300) {
          response.config = requestConfig; // Para que cacheSet pueda verificar método
          cacheSet(cacheKey, response, svc);
        }
      }

      return response;

    } catch (err) {
      lastError = err;

      // Errores de red/timeout
      if (isNetworkOrTimeout(err)) {
        if (config.resilience.enabled) {
          console.log(`[CB] ${svc}: network/timeout error: ${err.code || err.message}`);
        }
        cb.record(false, err);
        
        if (!retryable || attempt >= maxAttempts) {
          // Intentar servir stale cache antes de lanzar error (solo para GET)
          if (cacheKey && normalizedMethod === 'GET') {
            const cached = cacheGet(cacheKey);
            if (cached && cached.isStale) {
              const staleResponse = {
                status: 200,
                data: { ...cached.value.data, _stale: true },
                headers: { ...cached.value.headers, 'x-data-source': 'stale-cache' },
                fromCache: true
              };
              return staleResponse;
            }
          }

          const timeoutError = new Error('Backend no responde (timeout/red)');
          timeoutError.code = err.code || 'ECONNABORTED';
          timeoutError.isRetryable = true;
          timeoutError.response = { 
            status: 503, 
            data: { 
              error: 'SERVICE_UNAVAILABLE', 
              message: 'Backend no responde (timeout/red)' 
            } 
          };
          throw timeoutError;
        }
        
        const backoff = config.resilience.retry.baseDelayMs * Math.pow(2, attempt - 1);
        await sleep(backoff);
        continue;
      }

      // Si hay respuesta con status
      if (err.response) {
        const { status, data } = err.response;
        
        // No contaminar con probes
        if (reqPath && isProbePath(reqPath)) {
          cb.record(true);
          return err.response;
        }

        if (isRetryableStatus(status)) {
          if (config.resilience.enabled) {
            console.log(`[CB] ${svc}: status=${status} retryable=true path=${reqPath || 'unknown'}`);
          }
          cb.record(false, err);
        } else {
          if (config.resilience.enabled) {
            console.log(`[CB] ${svc}: status=${status} retryable=false path=${reqPath || 'unknown'}`);
          }
          cb.record(true, null); // 4xx no cuenta como fallo
        }

        if (!retryable || !isRetryableStatus(status) || attempt >= maxAttempts) {
          // Intentar servir stale cache antes de devolver error 5xx (solo para GET)
          if (cacheKey && normalizedMethod === 'GET' && isRetryableStatus(status)) {
            const cached = cacheGet(cacheKey);
            if (cached && cached.isStale) {
              const staleResponse = {
                status: 200,
                data: { ...cached.value.data, _stale: true },
                headers: { ...cached.value.headers, 'x-data-source': 'stale-cache' },
                fromCache: true
              };
              return staleResponse;
            }
          }
          return err.response;
        }

        // Retry solo para errores retryables
        const backoff = config.resilience.retry.baseDelayMs * Math.pow(2, attempt - 1);
        if (config.resilience.enabled) {
          console.log(`[CB] ${svc}: Retry ${attempt}/${maxAttempts} después de ${backoff}ms (status: ${status})`);
        }
        await sleep(backoff);
        continue;
      }

      // Fallback: error desconocido
      cb.record(false, err);
      if (attempt >= maxAttempts) {
        const unknownError = new Error('Fallo inesperado del backend');
        unknownError.code = err.code || 'UNKNOWN';
        unknownError.status = 503;
        unknownError.response = {
          status: 503,
          data: {
            error: 'SERVICE_UNAVAILABLE',
            message: 'Fallo inesperado del backend'
          }
        };
        throw unknownError;
      }

      const backoff = config.resilience.retry.baseDelayMs * Math.pow(2, attempt - 1);
      await sleep(backoff);
    }
  }

  // Fallback final
  if (lastError) {
    cb.record(false, lastError);
    // Asegurar que lastError tenga las propiedades necesarias
    if (!(lastError instanceof Error)) {
      const normalizedErr = normalizeError(lastError);
      throw normalizedErr;
    }
    // Asegurar que tenga code y status
    if (!lastError.code) {
      lastError.code = lastError.response?.status?.toString() || 'UNKNOWN';
    }
    if (!lastError.status && !lastError.response?.status) {
      lastError.status = 503;
    }
    throw lastError;
  }
  const unexpectedError = new Error('Unexpected error: no error recorded');
  unexpectedError.code = 'UNEXPECTED';
  unexpectedError.status = 503;
  unexpectedError.name = 'Error';
  throw unexpectedError;
};

// Helper para normalizar URL destino
const buildTargetUrl = (baseUrl, reqPath, queryString) => {
  // Normalizar path (sin barra extra antes del ?)
  const normalizedPath = reqPath.endsWith('/') ? reqPath.slice(0, -1) : reqPath;
  return baseUrl + normalizedPath + (queryString || '');
};

// B) Respuesta estándar cuando el circuito esté OPEN
function sendStandardErrorResponse(req, res, error, serviceName) {
  // Normalizar error antes de usar
  const normalized = normalizeError(error);
  
  // Logging usando logProxyError
  logProxyError(req, serviceName, normalized);
  
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  res.set('X-Correlation-Id', correlationId);
  
  // B) Si es CIRCUIT_OPEN, setear headers especiales
  if (normalized.code === 'CIRCUIT_OPEN' || normalized.isCircuitOpen) {
    res.set('X-CB-State', 'OPEN');
    // Si el breaker expone ms restantes, setear Retry-After
    const svc = serviceName || 'default';
    const cb = getBreaker(svc);
    if (cb.msRemaining) {
      const msRemaining = cb.msRemaining();
      if (typeof msRemaining === 'number' && msRemaining > 0) {
        res.set('Retry-After', Math.ceil(msRemaining / 1000).toString());
      }
    }
  }
  
  // Respuesta JSON estandarizada
  return res.status(normalized.status || 503).json({
    error: normalized.code || 'SERVICE_UNAVAILABLE',
    message: normalized.message || 'Servicio no disponible temporalmente',
    service: serviceName,
    route: req.originalUrl || req.url,
    method: req.method,
    correlationId,
    timestamp: new Date().toISOString()
  });
}

// Proxy personalizado para admin-service con Circuit Breaker
// Reemplaza http-proxy-middleware para tener protección completa
router.use('/admin', async (req, res) => {
  try {
    // Remover /admin del path antes de enviarlo al servicio
    const rawPath = req.path.replace(/^\/admin/, '') || '/';
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const targetUrl = buildTargetUrl(config.services.admin, rawPath, qs);
    
    console.log(`[ADMIN PROXY] ${req.method} ${req.url} -> ${targetUrl}`);
    
    const requestConfig = {
      method: req.method,
      url: targetUrl,
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
    
    const response = await performRequest(requestConfig, req.method, 'admin-service', rawPath);
    
    // Manejar respuesta stale del caché
    if (response.fromCache && response.headers?.['x-data-source'] === 'stale-cache') {
      Object.keys(response.headers).forEach(key => {
        res.setHeader(key, response.headers[key]);
      });
      res.status(200).json(response.data);
      console.log(`[ADMIN PROXY] ${req.method} ${req.url} -> 200 (stale cache)`);
      return;
    }
    
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
    sendStandardErrorResponse(req, res, error, 'admin-service');
  }
});

// Proxy personalizado para médico-service usando el cliente HTTP compartido
if (config.services.medico) {
  console.log(`[GATEWAY] Configurando proxy para médico-service: ${config.services.medico}`);
  
  router.use('/medico', async (req, res) => {
    try {
      // Normalizar path
      const rawPath = req.path.replace(/^\/medico/, '') || '/';
      const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
      const targetUrl = buildTargetUrl(config.services.medico, rawPath, qs);
      
      console.log(`[MEDICO PROXY] ${req.method} ${req.url} -> ${targetUrl}`);
      
      const requestConfig = {
        method: req.method,
        url: targetUrl,
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
      
      const response = await performRequest(requestConfig, req.method, 'medico-service', rawPath);
      
      // Manejar respuesta stale del caché
      if (response.fromCache && response.headers?.['x-data-source'] === 'stale-cache') {
        Object.keys(response.headers).forEach(key => {
          res.setHeader(key, response.headers[key]);
        });
        res.status(200).json(response.data);
        console.log(`[MEDICO PROXY] ${req.method} ${req.url} -> 200 (stale cache)`);
        return;
      }
      
      res.status(response.status).json(response.data);
      
      console.log(`[MEDICO PROXY RESPONSE] ${req.method} ${req.url} -> ${response.status}`);
    } catch (error) {
      sendStandardErrorResponse(req, res, error, 'medico-service');
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
      // Normalizar path
      const rawPath = servicePath + (req.path || req.url.split('?')[0]);
      const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
      const targetUrl = buildTargetUrl(config.services.admin, rawPath, qs);
      
      console.log(`[PROXY] ${req.method} ${req.url} -> ${targetUrl}`);
      
      const requestConfig = {
        method: req.method,
        url: targetUrl,
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
      const response = await performRequest(requestConfig, req.method, 'admin-service', rawPath);
      console.log(`[PROXY] performRequest completado para ${req.method} ${req.url}`);
      
      // Manejar respuesta stale del caché
      if (response.fromCache && response.headers?.['x-data-source'] === 'stale-cache') {
        Object.keys(response.headers).forEach(key => {
          res.setHeader(key, response.headers[key]);
        });
        res.status(200).json(response.data);
        console.log(`[PROXY] ${req.method} ${req.url} -> 200 (stale cache)`);
        return;
      }
      
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
      sendStandardErrorResponse(req, res, error, 'admin-service');
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