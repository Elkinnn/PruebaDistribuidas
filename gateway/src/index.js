const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Proxy routes
app.use('/api/admin', createProxyMiddleware({
  target: process.env.ADMIN_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/admin': ''
  }
}));

app.use('/api/medico', createProxyMiddleware({
  target: process.env.MEDICO_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/medico': ''
  }
}));

// Serve frontend (en producción)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../apps/frontend/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../apps/frontend/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Gateway running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Admin service: http://localhost:${PORT}/api/admin`);
  console.log(`🔗 Medico service: http://localhost:${PORT}/api/medico`);
});
