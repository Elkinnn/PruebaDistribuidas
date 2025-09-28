import { useState, useEffect } from "react";

export default function PaginationInfo({ page, pageSize, total, loading = false }) {
  const [isVisible, setIsVisible] = useState(true);
  const safePageSize = pageSize || 1;
  const safeTotal = total || 0;
  const totalPages = Math.max(1, Math.ceil(safeTotal / safePageSize));

  // Calcular el rango de elementos mostrados
  const startItem = (page - 1) * safePageSize + 1;
  const endItem = Math.min(page * safePageSize, safeTotal);

  // Auto-ocultar después de 3 segundos en móviles
  useEffect(() => {
    if (window.innerWidth < 768) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [page]);

  if (loading || safeTotal === 0) return null;

  return (
    <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="font-medium">
          Mostrando {startItem}-{endItem} de {safeTotal} registros
        </span>
        {totalPages > 1 && (
          <span className="px-2 py-0.5 bg-slate-200 rounded text-slate-600">
            Página {page} de {totalPages}
          </span>
        )}
      </div>
      
      {window.innerWidth < 768 && isVisible && (
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-slate-600"
          aria-label="Ocultar información"
        >
          ✕
        </button>
      )}
    </div>
  );
}
