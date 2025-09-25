// apps/admin-service/src/infrastructure/services/auto-cancel.service.js
const citaRepo = require('../persistence/cita.repo');

class AutoCancelService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.intervalMs = 60000; // 1 minuto
  }

  start() {
    if (this.isRunning) {
      console.log('AutoCancelService ya está ejecutándose');
      return;
    }

    console.log('🔄 Iniciando AutoCancelService - Cancelación automática de citas cada minuto');
    this.isRunning = true;
    
    // Ejecutar inmediatamente al iniciar
    this.executeCancelation();
    
    // Luego ejecutar cada minuto
    this.intervalId = setInterval(() => {
      this.executeCancelation();
    }, this.intervalMs);
  }

  stop() {
    if (!this.isRunning) {
      console.log('AutoCancelService no está ejecutándose');
      return;
    }

    console.log('⏹️ Deteniendo AutoCancelService');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async executeCancelation() {
    try {
      const result = await citaRepo.cancelarCitasPasadas();
      
      if (result.citasCanceladas > 0) {
        console.log(`✅ AutoCancelService: ${result.mensaje}`);
      } else {
        console.log('ℹ️ AutoCancelService: No hay citas para cancelar');
      }
    } catch (error) {
      console.error('❌ Error en AutoCancelService:', error.message);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMs: this.intervalMs,
      nextExecution: this.isRunning ? new Date(Date.now() + this.intervalMs) : null
    };
  }
}

// Instancia singleton
const autoCancelService = new AutoCancelService();

module.exports = autoCancelService;
