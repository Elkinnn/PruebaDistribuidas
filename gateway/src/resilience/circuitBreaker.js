// Circuit Breaker simple in-memory por servicio
const states = new Map(); // serviceName -> { fails, total, openedAt, state, last }

function now() { return Date.now(); }

module.exports = {
  getBreaker(serviceName, opts) {
    const {
      windowMs = Number(process.env.CB_WINDOW_MS ?? 30000),
      thresholdPercent = Number(process.env.CB_THRESHOLD_PERCENT ?? 50),
      halfOpenAfterMs = Number(process.env.CB_HALF_OPEN_AFTER_MS ?? 20000),
    } = opts || {};

    if (!states.has(serviceName)) {
      states.set(serviceName, { fails: 0, total: 0, openedAt: 0, state: 'CLOSED', last: 0 });
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
            console.log(`[CB] ${serviceName}: OPEN -> HALF_OPEN (permitiendo intento de prueba)`);
            return true; // un intento de prueba
          }
          console.log(`[CB] ${serviceName}: Circuit OPEN (rechazando request, ${halfOpenAfterMs - elapsed}ms restantes)`);
          return false;
        }
        return true;
      },
      record(success) {
        const s = states.get(serviceName);
        const oldState = s.state;
        s.total++;
        s.last = now();
        if (!success) s.fails++;
        const rate = s.total ? (s.fails * 100 / s.total) : 0;

        if (s.state === 'HALF_OPEN') {
          if (!success) {
            s.state = 'OPEN';
            s.openedAt = now();
            console.log(`[CB] ${serviceName}: HALF_OPEN -> OPEN (fallo en prueba)`);
            return;
          }
          s.state = 'CLOSED';
          console.log(`[CB] ${serviceName}: HALF_OPEN -> CLOSED (éxito en prueba)`);
          s.fails = 0;
          s.total = 0;
          return;
        }
        
        if (rate >= thresholdPercent && s.total >= 2 && s.state !== 'OPEN') {
          s.state = 'OPEN';
          s.openedAt = now();
          console.log(`[CB] ${serviceName}: CLOSED -> OPEN (rate: ${rate.toFixed(1)}%, fails: ${s.fails}/${s.total})`);
        } else if (s.state === 'OPEN' && (now() - s.openedAt) >= halfOpenAfterMs) {
          s.state = 'HALF_OPEN';
          console.log(`[CB] ${serviceName}: OPEN -> HALF_OPEN (tiempo transcurrido: ${now() - s.openedAt}ms)`);
        } else if (oldState !== s.state) {
          console.log(`[CB] ${serviceName}: ${oldState} -> ${s.state} (rate: ${rate.toFixed(1)}%, fails: ${s.fails}/${s.total})`);
        }
      },
      state() { return states.get(serviceName).state; }
    };
  }
};

