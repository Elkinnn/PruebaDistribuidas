const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');

// Configuración común para todos los proxies
const createProxyConfig = (target, pathRewrite = {}) => ({
  target,
  changeOrigin: true,
  pathRewrite,
  timeout: config.timeout,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY] ${req.method} ${req.url} -> ${target}${req.url}`);
    
    // Pasar headers de autorización
    if (req.headers.authorization) {
      proxyReq.setHeader('authorization', req.headers.authorization);
      console.log(`[PROXY] Passing authorization header to ${target}`);
    }
    
    // Pasar otros headers importantes
    if (req.headers['content-type']) {
      proxyReq.setHeader('content-type', req.headers['content-type']);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[PROXY RESPONSE] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error(`[PROXY ERROR] ${req.method} ${req.url}:`, err.message);
    res.status(500).json({
      error: 'PROXY_ERROR',
      message: 'Error de conexión con el servicio backend'
    });
  }
});

// Proxy para rutas que manejan archivos (PDFs)
const createFileProxyConfig = (target, pathRewrite = {}) => ({
  ...createProxyConfig(target, pathRewrite),
  onProxyRes: (proxyRes, req, res) => {
    // Para archivos, copiar todos los headers excepto content-encoding
    Object.keys(proxyRes.headers).forEach(key => {
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, proxyRes.headers[key]);
      }
    });
  }
});

module.exports = {
  createProxyConfig,
  createFileProxyConfig
};
