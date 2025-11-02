const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { createProxyConfig, createFileProxyConfig } = require('../middleware/proxy');
const config = require('../config');
const http = require('../http');
const router = express.Router();

const RETRYABLE_METHODS = new Set(['GET', 'HEAD']);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) => {
  if (!error) return false;

  if (error.response && error.response.status >= 500) {
    return true;
  }

  const code = error.code ? String(error.code).toUpperCase() : undefined;
  const transientCodes = new Set(['ECONNRESET', 'ECONNABORTED', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN']);

  if (code && transientCodes.has(code)) {
    return true;
  }

  if (typeof error.message === 'string' && error.message.toLowerCase().includes('timeout')) {
    return true;
  }

  return false;
};

const shouldRetry = (method) => {
  if (!config.resilience.enabled) return false;
  if (!config.resilience.retry.enabled) return false;
  return RETRYABLE_METHODS.has(String(method || '').toUpperCase());
};

const performRequest = async (requestConfig, method) => {
  const normalizedMethod = String(method || requestConfig.method || 'GET').toUpperCase();
  const maxAttempts = Math.max(1, config.resilience.retry.maxAttempts);
  const retryable = shouldRetry(normalizedMethod);

  let attempt = 0;
  let lastError;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      return await http({
        ...requestConfig,
        method: normalizedMethod
      });
    } catch (error) {
      lastError = error;

      if (!retryable || attempt >= maxAttempts || !isRetryableError(error)) {
        throw error;
      }

      const backoff = config.resilience.retry.baseDelayMs * Math.pow(2, attempt - 1);
      await sleep(backoff);
    }
  }

  throw lastError;
};

// Proxy especial para archivos binarios (PDFs) en /admin/citas/reportes/**
// IMPORTANTE: Esta ruta debe ir ANTES que /admin para que se ejecute
router.use('/admin/citas/reportes', createProxyMiddleware(
  createFileProxyConfig(config.services.admin, {
    '^/admin': '' // Remover /admin del path
  })
));

// Namespacing: /admin/** → ADMIN_SERVICE_URL
router.use('/admin', createProxyMiddleware(
  createProxyConfig(config.services.admin, {
    '^/admin': '' // Remover /admin del path
  })
));

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
      
      const response = await performRequest(requestConfig, req.method);
      res.status(response.status).json(response.data);
      
      console.log(`[MEDICO PROXY RESPONSE] ${req.method} ${req.url} -> ${response.status}`);
    } catch (error) {
      console.error(`[MEDICO PROXY ERROR] ${req.method} ${req.url}:`, error.message);
      if (error.response) {
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
      
      const response = await performRequest(requestConfig, req.method);
      
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
      if (error.response) {
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