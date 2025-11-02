/**
 * Cache LRU simple in-memory para stale-if-error
 * - TTL "fresco": CACHE_TTL_MS (default: 60000 = 1 min)
 * - TTL "stale permitido": CACHE_STALE_WHEN_ERROR_MS (default: 300000 = 5 min)
 * - Solo cachea GET y respuestas 2xx
 */

const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS || 60000);
const CACHE_STALE_WHEN_ERROR_MS = Number(process.env.CACHE_STALE_WHEN_ERROR_MS || 300000);
const CACHE_MAX_SIZE = Number(process.env.CACHE_MAX_SIZE || 100);

class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  _evictLRU() {
    if (this.cache.size >= this.maxSize) {
      // Eliminar el más antiguo (primero en el Map)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  set(key, value) {
    this._evictLRU();
    this.cache.delete(key); // Mover al final (LRU)
    this.cache.set(key, value);
  }

  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }
    const value = this.cache.get(key);
    // Mover al final (LRU)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new LRUCache(CACHE_MAX_SIZE);

/**
 * Genera clave de caché: serviceName|method|normalizedUrl
 */
function buildCacheKey(serviceName, method, url) {
  // Normalizar URL: remover query params de orden, pero mantener otros
  try {
    const urlObj = new URL(url);
    const normalized = `${urlObj.origin}${urlObj.pathname}`;
    return `${serviceName}|${method.toUpperCase()}|${normalized}`;
  } catch {
    // Si URL es relativa o inválida, usar como está
    return `${serviceName}|${method.toUpperCase()}|${url}`;
  }
}

/**
 * Obtiene valor del caché y verifica si está fresh o stale
 * @returns {null | {value: object, isFresh: boolean, isStale: boolean}}
 */
function cacheGet(key) {
  const cached = cache.get(key);
  if (!cached) return null;

  const now = Date.now();
  const age = now - cached.ts;
  
  const isFresh = age <= CACHE_TTL_MS;
  const isStale = age <= CACHE_STALE_WHEN_ERROR_MS && age > CACHE_TTL_MS;

  return {
    value: cached,
    isFresh,
    isStale
  };
}

/**
 * Guarda respuesta en caché (solo GET con status 2xx)
 */
function cacheSet(key, response, serviceName) {
  if (!response || response.status < 200 || response.status >= 300) {
    return false; // No cachear 4xx/5xx
  }

  // Solo cachear GET
  const method = response.config?.method || 'GET';
  if (method.toUpperCase() !== 'GET') {
    return false;
  }

  // Limitar tamaño del body (no cachear respuestas enormes)
  const dataStr = JSON.stringify(response.data || {});
  if (dataStr.length > 100000) { // 100KB
    return false;
  }

  // Copiar headers útiles
  const headersSubset = {};
  const usefulHeaders = ['content-type', 'cache-control', 'etag'];
  usefulHeaders.forEach(header => {
    const value = response.headers?.[header] || response.headers?.[header.toLowerCase()];
    if (value) {
      headersSubset[header] = value;
    }
  });

  cache.set(key, {
    status: response.status,
    headers: headersSubset,
    data: response.data,
    ts: Date.now(),
    service: serviceName
  });

  return true;
}

module.exports = {
  buildCacheKey,
  cacheGet,
  cacheSet,
  clear: () => cache.clear()
};

