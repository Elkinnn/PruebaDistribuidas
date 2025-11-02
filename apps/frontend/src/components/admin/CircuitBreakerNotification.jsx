import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

// LOG INMEDIATO al cargar el módulo
console.error('🔴 [CB NOTIFICATION] Módulo cargado - timestamp:', new Date().toISOString());
console.error('🔴 [CB NOTIFICATION] typeof window:', typeof window);
console.error('🔴 [CB NOTIFICATION] window disponible:', typeof window !== 'undefined');

export default function CircuitBreakerNotification() {
  // LOG INMEDIATO cuando el componente se renderiza
  console.error('🔴 [CB NOTIFICATION] Componente renderizado (función ejecutada)');
  
  const [isCircuitOpen, setIsCircuitOpen] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.error('🔴 [CB NOTIFICATION] Componente montado');
    
    // Escuchar cambios desde el contexto global
    const handleCBChange = (event) => {
      const { isOpen, error } = event.detail || {};
      console.error('🔴 [CB NOTIFICATION] Evento recibido:', { isOpen, error });
      setIsCircuitOpen(isOpen);
      setLastError(error);
      setIsVisible(isOpen);
    };

    // Escuchar eventos personalizados
    window.addEventListener('circuit-breaker-state-change', handleCBChange);
    
    // También monitorear el estado global directamente
    let lastCheckedState = { isOpen: false };
    const checkGlobalState = () => {
      if (typeof window !== 'undefined' && window.__CB_GLOBAL_STATE__) {
        const state = window.__CB_GLOBAL_STATE__;
        if (state.isOpen !== lastCheckedState.isOpen) {
          console.error('🔴 [CB NOTIFICATION] Estado global detectado:', state);
          setIsCircuitOpen(state.isOpen);
          setLastError(state.error);
          setIsVisible(state.isOpen);
          lastCheckedState = state;
        }
      }
    };
    
    const interval = setInterval(checkGlobalState, 500);
    
    // Detectar errores 503 directamente monitoreando las peticiones HTTP
    // Interceptar XMLHttpRequest para detectar 503 (esto funciona incluso si axios interceptor falla)
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    
    // Almacenar URL por instancia en lugar de variable global
    const urlMap = new WeakMap();
    
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      const fullUrl = typeof url === 'string' ? url : url.toString();
      urlMap.set(this, fullUrl);
      return originalOpen.apply(this, [method, url, ...rest]);
    };
    
    XMLHttpRequest.prototype.send = function(...args) {
      const xhr = this;
      const url = urlMap.get(xhr) || '';
      
      // Detectar 503 en load (se dispara incluso para errores HTTP)
      xhr.addEventListener('load', function() {
        const status = xhr.status;
        const responseUrl = url || xhr.responseURL || '';
        
        // Normalizar URL para comparación (puede ser relativa o absoluta)
        const normalizedUrl = responseUrl.toLowerCase();
        const isMedicoService = normalizedUrl.includes('/medico/') || 
                                normalizedUrl.includes('/medico?') ||
                                normalizedUrl.includes('medico-service') ||
                                normalizedUrl.includes('api/medico');
        
        // Solo procesar errores 503 que NO sean de servicios médicos
        if (status === 503 && !isMedicoService) {
          console.error('🔴 [CB NOTIFICATION] Detectado 503 en XMLHttpRequest:', {
            url: responseUrl,
            normalizedUrl,
            status,
            statusText: xhr.statusText,
            isMedicoService
          });
          
          const errorInfo = {
            status: 503,
            code: 'CIRCUIT_OPEN',
            message: 'El servicio de administración está temporalmente no disponible'
          };
          
          setIsCircuitOpen(true);
          setLastError(errorInfo);
          setIsVisible(true);
          
          // Actualizar estado global para otros componentes
          if (typeof window !== 'undefined') {
            window.__CB_GLOBAL_STATE__ = { 
              isOpen: true, 
              error: errorInfo
            };
            window.dispatchEvent(new CustomEvent('circuit-breaker-state-change', {
              detail: { isOpen: true, error: errorInfo }
            }));
            console.error('🔴 [CB NOTIFICATION] Estado actualizado y notificado');
          }
        } else if (status >= 200 && status < 300 && !isMedicoService) {
          // Si hay una respuesta exitosa, el servicio está disponible
          setIsCircuitOpen(false);
          setLastError(null);
          setIsVisible(false);
          
          if (typeof window !== 'undefined') {
            window.__CB_GLOBAL_STATE__ = { isOpen: false, error: null };
            window.dispatchEvent(new CustomEvent('circuit-breaker-state-change', {
              detail: { isOpen: false, error: null }
            }));
          }
        }
      });
      
      // También escuchar errores de red
      xhr.addEventListener('error', function() {
        const responseUrl = urlMap.get(xhr) || xhr.responseURL || '';
        const normalizedUrl = responseUrl.toLowerCase();
        const isMedicoService = normalizedUrl.includes('/medico/') || 
                                normalizedUrl.includes('/medico?') ||
                                normalizedUrl.includes('medico-service');
        if (!isMedicoService) {
          console.error('🔴 [CB NOTIFICATION] Error de red detectado:', responseUrl);
        }
      });
      
      return originalSend.apply(this, args);
    };

    return () => {
      window.removeEventListener('circuit-breaker-state-change', handleCBChange);
      clearInterval(interval);
      // Restaurar XMLHttpRequest original
      XMLHttpRequest.prototype.open = originalOpen;
      XMLHttpRequest.prototype.send = originalSend;
    };
  }, []);

  useEffect(() => {
    console.error('🔴 [CB NOTIFICATION] Estado cambiado:', { isCircuitOpen, lastError, isVisible });
    // isVisible se controla directamente en el primer useEffect cuando se detecta el cambio
  }, [isCircuitOpen, lastError]);

  // SIEMPRE renderizar el componente para que los interceptores funcionen
  // Solo ocultarlo visualmente si no hay error
  if (!isCircuitOpen) {
    return <div style={{ display: 'none' }} />;
  }

  const errorMessage = lastError?.message || 
    "El servicio de administración está temporalmente no disponible. Por favor, intenta nuevamente en unos momentos.";

  return (
    <div className="fixed top-4 right-4 z-[100] max-w-md">
      <div 
        className={`bg-rose-50 border-2 border-rose-300 rounded-xl shadow-xl p-4 transform transition-all duration-300 ease-out ${
          isVisible 
            ? "translate-x-0 opacity-100 scale-100" 
            : "translate-x-full opacity-0 scale-95"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-rose-900 text-sm mb-1">
              ⚠️ Servicio no disponible
            </h4>
            <p className="text-sm text-rose-800 leading-relaxed">
              {errorMessage}
            </p>
            <p className="text-xs text-rose-700 mt-2 italic">
              El sistema intentará reconectarse automáticamente cuando el servicio esté disponible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

