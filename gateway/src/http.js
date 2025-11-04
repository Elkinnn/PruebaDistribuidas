const axios = require('axios');
const config = require('./config');
const { getBreaker } = require('./resilience/circuitBreaker');

// Usar el timeout configurado en la config (HTTP_TIMEOUT_MS env var o 5000ms por defecto)
// El timeout del gateway debe ser menor al del navegador para evitar colas y ECONNABORTED en cliente
const GATEWAY_TIMEOUT_MS = config.http.timeoutMs || 5000;

const http = axios.create({
  timeout: GATEWAY_TIMEOUT_MS,
  // Permitir todos los status codes para clasificación manual
  validateStatus: () => true
});

function shouldRetryMethod(method) {
  return method === 'GET' || method === 'HEAD';
}

function shouldRetryError(err) {
  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) return true;
  const status = err.response?.status;
  return !status || (status >= 500 && status < 600);
}

async function requestWithRetry(requestConfig) {
  const method = (requestConfig.method || 'GET').toUpperCase();
  const retryEnabled = config.resilience.enabled && config.resilience.retry.enabled && shouldRetryMethod(method);
  const maxAttempts = retryEnabled ? config.resilience.retry.maxAttempts : 1;
  const baseDelay = config.resilience.retry.baseDelayMs;

  const svc = requestConfig.__serviceName || 'default';
  
  // Usar la misma lógica isFailure que performRequest para consistencia
  // ECONNRESET puede ser temporal en Azure, así que lo tratamos de manera más permisiva
  const isFailure = (err) => {
    const status = err?.response?.status;
    if (err?.code === 'ECONNABORTED') return true; // timeout definitivo
    // Solo errores de conexión graves cuentan como fallo inmediato
    // ECONNRESET puede ser temporal, así que no lo contamos como fallo inmediato
    if (['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN'].includes(err?.code)) return true;
    if (typeof status === 'number' && status >= 500) return true;
    return false; // 4xx, ECONNRESET temporal NO cuentan como fallo inmediato
  };
  
  const cb = getBreaker(svc, {
    windowMs: Number(process.env.CB_WINDOW_MS ?? 60000),
    thresholdPercent: Number(process.env.CB_THRESHOLD_PERCENT ?? 80), // 80% (más permisivo)
    halfOpenAfterMs: Number(process.env.CB_HALF_OPEN_AFTER_MS ?? 5000), // 5s (más rápido)
    minRequests: Number(process.env.CB_MIN_REQUESTS ?? 20), // 20 muestras mínimas (más tolerante)
    isFailure,
  });

  if (!cb.canPass()) {
    const e = new Error('Circuit open');
    e.isCircuitOpen = true;
    e.response = { status: 503, data: { error: 'CIRCUIT_OPEN', message: 'Temporalmente no disponible' } };
    throw e;
  }

  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      const resp = await http(requestConfig);
      cb.record(true, null);
      return resp;
    } catch (err) {
      const okToRetry = retryEnabled && shouldRetryError(err);
      attempt++;
      const isLast = attempt >= maxAttempts;
      if (!okToRetry || isLast) {
        cb.record(false, err); // Pasar el error para que isFailure lo evalúe
        throw err;
      }
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

module.exports = http;
module.exports.requestWithRetry = requestWithRetry;



