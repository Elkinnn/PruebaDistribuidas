const axios = require('axios');
const config = require('./config');
const { getBreaker } = require('./resilience/circuitBreaker');

const http = axios.create({
  timeout: config.http.timeoutMs
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
  const cb = getBreaker(svc, {
    windowMs: Number(process.env.CB_WINDOW_MS ?? 30000),
    thresholdPercent: Number(process.env.CB_THRESHOLD_PERCENT ?? 50),
    halfOpenAfterMs: Number(process.env.CB_HALF_OPEN_AFTER_MS ?? 20000),
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
      cb.record(true);
      return resp;
    } catch (err) {
      const okToRetry = retryEnabled && shouldRetryError(err);
      attempt++;
      const isLast = attempt >= maxAttempts;
      if (!okToRetry || isLast) {
        cb.record(false);
        throw err;
      }
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

module.exports = http;
module.exports.requestWithRetry = requestWithRetry;



