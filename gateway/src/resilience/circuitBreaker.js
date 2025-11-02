// Circuit Breaker simple in-memory por servicio
const states = new Map(); // serviceName -> { fails, total, openedAt, state, last }

function now() { return Date.now(); }

module.exports = {
  // Función para resetear el Circuit Breaker manualmente
  reset(serviceName) {
    if (serviceName) {
      if (states.has(serviceName)) {
        const s = states.get(serviceName);
        s.state = 'CLOSED';
        s.fails = 0;
        s.total = 0;
        s.openedAt = 0;
        console.log(`[CB] ${serviceName}: Circuit Breaker RESETEADO manualmente`);
        return true;
      }
    } else {
      // Resetear todos los servicios
      states.clear();
      console.log(`[CB] Todos los Circuit Breakers RESETEADOS manualmente`);
      return true;
    }
    return false;
  },
  
  getBreaker(serviceName, opts) {
    // C) Ajustes del Circuit Breaker con valores estándar
    const {
      windowMs = Number(process.env.CB_WINDOW_MS ?? 60000), // 60s ventana
      thresholdPercent = Number(process.env.CB_THRESHOLD_PERCENT ?? 50), // 50% para abrir
      halfOpenAfterMs = Number(process.env.CB_HALF_OPEN_AFTER_MS ?? 15000), // 15s en OPEN
      minRequests = Number(process.env.CB_MIN_REQUESTS ?? 20), // mínimo 20 muestras
      isFailure = null, // función para determinar si cuenta como fallo
    } = opts || {};

    if (!states.has(serviceName)) {
      states.set(serviceName, { 
        fails: 0, 
        total: 0, 
        openedAt: 0, 
        state: 'CLOSED', 
        last: 0,
        halfOpenAttempts: 0 // C) Contador para half-open (máximo 1 probe)
      });
    }

    function resetIfWindowExpired(win) {
      const s = states.get(serviceName);
      if (now() - s.last > win) { s.fails = 0; s.total = 0; }
    }

    return {
      canPass() {
        const s = states.get(serviceName);
        resetIfWindowExpired(windowMs);
        if (s.state === 'OPEN') {
          const elapsed = now() - s.openedAt;
          if (elapsed >= halfOpenAfterMs) {
            s.state = 'HALF_OPEN';
            s.halfOpenAttempts = 0; // Resetear contador al entrar en HALF_OPEN
            console.log(`[CB] ${serviceName}: OPEN -> HALF_OPEN (permitiendo intento de prueba, ${halfOpenAfterMs}ms transcurridos)`);
            return true; // permitir 1 probe
          }
          const remaining = halfOpenAfterMs - elapsed;
          console.log(`[CB] ${serviceName}: Circuit OPEN (rechazando request, ${remaining}ms restantes)`);
          return false;
        }
        // C) HALF_OPEN: máximo 1 probe (halfOpenMaxCalls: 1)
        if (s.state === 'HALF_OPEN') {
          if (s.halfOpenAttempts >= 1) {
            return false; // Ya se hizo el probe, rechazar hasta que se evalúe
          }
          return true;
        }
        return true;
      },
      // Exponer msRemaining para Retry-After header
      msRemaining() {
        const s = states.get(serviceName);
        if (s.state === 'OPEN') {
          const elapsed = now() - s.openedAt;
          return Math.max(0, halfOpenAfterMs - elapsed);
        }
        return 0;
      },
      record(success, err = null) {
        const s = states.get(serviceName);
        const oldState = s.state;
        s.total++;
        s.last = now();
        
        // C) Usar isFailure si está disponible, sino usar success boolean
        const isFailing = isFailure ? isFailure(err) : !success;
        if (isFailing) s.fails++;
        
        const rate = s.total ? (s.fails * 100 / s.total) : 0;

        if (s.state === 'HALF_OPEN') {
          s.halfOpenAttempts = (s.halfOpenAttempts || 0) + 1;
          // C) Evaluar usando isFailure si está disponible
          const failed = isFailure ? isFailure(err) : !success;
          if (failed) {
            s.state = 'OPEN';
            s.openedAt = now();
            s.halfOpenAttempts = 0;
            console.log(`[CB] ${serviceName}: HALF_OPEN -> OPEN (fallo en prueba)`);
            return;
          }
          s.state = 'CLOSED';
          s.halfOpenAttempts = 0;
          console.log(`[CB] ${serviceName}: HALF_OPEN -> CLOSED (éxito en prueba)`);
          s.fails = 0;
          s.total = 0;
          return;
        }
        
        // Solo abrir si hay un mínimo de requests Y el rate supera el threshold
        if (s.state !== 'OPEN' && s.total >= minRequests && rate >= thresholdPercent) {
          s.state = 'OPEN';
          s.openedAt = now();
          console.log(`[CB] ${serviceName}: CLOSED -> OPEN (rate: ${rate.toFixed(1)}%, fails: ${s.fails}/${s.total}, minRequests: ${minRequests})`);
        } else if (s.state === 'OPEN' && (now() - s.openedAt) >= halfOpenAfterMs) {
          s.state = 'HALF_OPEN';
          console.log(`[CB] ${serviceName}: OPEN -> HALF_OPEN (tiempo transcurrido: ${now() - s.openedAt}ms)`);
        } else if (oldState !== s.state) {
          console.log(`[CB] ${serviceName}: ${oldState} -> ${s.state} (rate: ${rate.toFixed(1)}%, fails: ${s.fails}/${s.total})`);
        }
        
        // Log de registro (solo en debug)
        if (process.env.DEBUG || process.env.LOG_LEVEL === 'debug') {
          console.log(`[CB] ${serviceName}: register${success ? 'Success' : 'Failure'} (total: ${s.total}, fails: ${s.fails})`);
        }
      },
      state() { return states.get(serviceName).state; }
    };
  }
};

