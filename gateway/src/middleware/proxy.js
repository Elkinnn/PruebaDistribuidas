const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');

// Configuración base del proxy
const createProxyConfig = (target, pathRewrite = {}) => ({
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
    console.error(`[PROXY ERROR] ${req.method} ${req.url}:`, err.message);
    res.status(502).json({
      error: 'UPSTREAM_UNAVAILABLE',
      message: 'Servicio backend no disponible'
    });
  }
});

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