const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');

// Helper para normalizar errores (similar al de proxy.js)
function normalizeErrorMiddleware(err) {
  if (!err) {
    const e = new Error('unknown_error');
    e.code = 'UNKNOWN';
    e.status = 502;
    return e;
  }
  
  if (err instanceof Error) {
    const e = new Error(String(err.message || err.toString() || 'unknown_error'));
    e.code = err.code || 'UNKNOWN';
    e.status = err.status || 502;
    return e;
  }
  
  if (typeof err === 'string') {
    const e = new Error(err || 'unknown_error');
    e.code = 'ERROR';
    e.status = 502;
    return e;
  }
  
  if (typeof err === 'object') {
    const message = err.message || err.msg || err.error || err.toString?.() || 'unknown_error';
    const e = new Error(String(message));
    e.code = err.code || 'UNKNOWN';
    e.status = err.status || 502;
    return e;
  }
  
  const e = new Error('unknown_error');
  e.code = 'UNKNOWN';
  e.status = 502;
  return e;
}

// Configuración base del proxy
const createProxyConfig = (target, pathRewrite = {}) => {
  // Extraer serviceName del target
  const serviceName = target ? target.replace(/^https?:\/\//, '').split('/')[0].split(':')[0] : 'unknown-service';
  
  return {
    target,
    changeOrigin: true,
    pathRewrite,
    timeout: config.timeout,
    proxyTimeout: config.timeout,
    buffer: false,
    onProxyReq: (proxyReq, req, res) => {
      // Propagar headers de autorización
      if (req.headers.authorization) {
        proxyReq.setHeader('authorization', req.headers.authorization);
      }
      
      // Añadir headers de trazabilidad
      if (req.id) {
        proxyReq.setHeader('x-request-id', req.id);
      }
      
      // Headers de forwarding
      proxyReq.setHeader('x-forwarded-for', req.ip || req.connection.remoteAddress);
      proxyReq.setHeader('x-forwarded-proto', req.protocol);
      
      // Pasar otros headers importantes
      if (req.headers['content-type']) {
        proxyReq.setHeader('content-type', req.headers['content-type']);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Reflejar x-request-id en la respuesta
      if (req.id) {
        res.setHeader('x-request-id', req.id);
      }
    },
    onError: (err, req, res) => {
      // Normalizar error antes de loguear
      const normalized = normalizeErrorMiddleware(err);
      const url = req?.originalUrl || req?.url || 'unknown';
      const method = req?.method || 'UNKNOWN';
      const status = normalized.status ?? 502;
      const code = normalized.code ?? 'UNKNOWN';
      const message = normalized.message ?? 'unknown_error';
      
      console.error(
        `[PROXY ERROR] ${method} ${url} -> ${serviceName} | status=${status} | code=${code} | msg=${message}`
      );
      
      res.status(502).json({
        error: 'UPSTREAM_UNAVAILABLE',
        message: 'Servicio backend no disponible'
      });
    }
  };
};

// Configuración especial para archivos binarios (PDFs)
const createFileProxyConfig = (target, pathRewrite = {}) => ({
  ...createProxyConfig(target, pathRewrite),
  onProxyRes: (proxyRes, req, res) => {
    // Para archivos PDF, mantener headers intactos
    Object.keys(proxyRes.headers).forEach(key => {
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, proxyRes.headers[key]);
      }
    });
    
    // Reflejar x-request-id
    if (req.id) {
      res.setHeader('x-request-id', req.id);
    }
  }
});

module.exports = {
  createProxyConfig,
  createFileProxyConfig
};