import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { registerCircuitBreakerNotifier } from '../api/client';

const CircuitBreakerContext = createContext(null);

// Variable global para compartir el estado entre el interceptor y el contexto
let globalCBState = {
  isOpen: false,
  error: null,
  listeners: new Set()
};

// Función para notificar cambios desde el interceptor
function notifyCircuitBreakerState(isOpen, error = null) {
  globalCBState.isOpen = isOpen;
  globalCBState.error = error;
  
  // Notificar a todos los listeners
  globalCBState.listeners.forEach(listener => {
    listener({ isOpen, error });
  });
  
  console.log('[CB Global] Estado actualizado:', { isOpen, error });
}

// Registrar el notificador en el cliente API
registerCircuitBreakerNotifier(notifyCircuitBreakerState);

// Registrar también en window para acceso global
if (typeof window !== 'undefined') {
  window.__CB_NOTIFY__ = notifyCircuitBreakerState;
  console.error('🔴 [CB CONTEXT] Notificador registrado en window.__CB_NOTIFY__');
}

// Si hay un estado pendiente, aplicarlo ahora
if (typeof window !== 'undefined' && window.__CB_PENDING_STATE__) {
  const pending = window.__CB_PENDING_STATE__;
  notifyCircuitBreakerState(pending.isOpen, pending.error);
  delete window.__CB_PENDING_STATE__;
}

export function CircuitBreakerProvider({ children }) {
  const [isCircuitOpen, setIsCircuitOpen] = useState(globalCBState.isOpen);
  const [lastError, setLastError] = useState(globalCBState.error);
  const listenerRef = useRef(null);

  useEffect(() => {
    // Crear listener que se registra en el Set global
    listenerRef.current = ({ isOpen, error }) => {
      console.log('[CB Context] Estado actualizado desde global:', { isOpen, error });
      setIsCircuitOpen(isOpen);
      setLastError(error);
    };

    // Registrar listener
    globalCBState.listeners.add(listenerRef.current);
    
    // Inicializar con el estado actual
    setIsCircuitOpen(globalCBState.isOpen);
    setLastError(globalCBState.error);
    
    console.log('[CB Context] Listener registrado. Estado inicial:', { 
      isOpen: globalCBState.isOpen, 
      error: globalCBState.error 
    });

    return () => {
      // Desregistrar listener
      if (listenerRef.current) {
        globalCBState.listeners.delete(listenerRef.current);
      }
    };
  }, []);

  const value = {
    isCircuitOpen,
    lastError
  };

  return (
    <CircuitBreakerContext.Provider value={value}>
      {children}
    </CircuitBreakerContext.Provider>
  );
}

export function useCircuitBreaker() {
  const context = useContext(CircuitBreakerContext);
  if (!context) {
    throw new Error('useCircuitBreaker must be used within CircuitBreakerProvider');
  }
  return context;
}
