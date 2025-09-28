import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState, useEffect } from "react";
import PaginationInfo from "./PaginationInfo";

export default function AdaptivePagination({ page, pageSize, total, onChange }) {
  const [isMobile, setIsMobile] = useState(false);
  const safePageSize = pageSize || 1;
  const safeTotal = total || 0;
  const totalPages = Math.max(1, Math.ceil(safeTotal / safePageSize));

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  function go(p) {
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== page) onChange(next);
  }

  // Generar números de página inteligentes
  const getPageNumbers = () => {
    const nums = [];
    const maxVisible = isMobile ? 3 : 5;
    
    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        nums.push(i);
      }
    } else {
      // Lógica inteligente para mostrar páginas relevantes
      let start = Math.max(1, page - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      // Ajustar si estamos cerca del final
      if (end === totalPages) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        nums.push(i);
      }
    }
    
    return nums;
  };

  const pageNumbers = getPageNumbers();
  const showFirstLast = totalPages > 7 && !isMobile;
  const showEllipsis = totalPages > 7 && !isMobile;

  if (totalPages <= 1) return null;

  return (
    <div className="w-full space-y-2">
      {/* Información de paginación */}
      <PaginationInfo page={page} pageSize={safePageSize} total={safeTotal} />
      
      {/* Versión móvil compacta */}
      {isMobile ? (
         <div className="bg-white/95 backdrop-blur border-t border-slate-200 py-3 -mx-4">
           <div className="flex items-center justify-between px-4">
             <div className="flex items-center gap-2">
            <button
              onClick={() => go(page - 1)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              disabled={page <= 1}
              aria-label="Página anterior"
            >
              <ChevronLeft size={18} />
            </button>
            
            <span className="text-sm font-medium text-slate-700 px-3 py-1 bg-slate-100 rounded-lg">
              {page} de {totalPages}
            </span>
            
            <button
              onClick={() => go(page + 1)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              disabled={page >= totalPages}
              aria-label="Página siguiente"
            >
              <ChevronRight size={18} />
            </button>
             </div>
           </div>
         </div>
      ) : (
         /* Versión desktop completa */
         <div className="bg-white/95 backdrop-blur border-t border-slate-200 py-4 -mx-6">
           <div className="flex items-center justify-between px-6">
            {/* Información de registros */}
            <div className="text-sm text-slate-600">
              <span className="font-medium">
                Página {page} de {totalPages}
              </span>
              <span className="mx-2">—</span>
              <span>{safeTotal} registros</span>
            </div>

            {/* Controles de navegación */}
            <div className="flex items-center gap-1">
              {/* Primera página */}
              {showFirstLast && (
                <>
                  <button
                    onClick={() => go(1)}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={page <= 1}
                    aria-label="Primera página"
                    title="Primera página"
                  >
                    <ChevronsLeft size={16} />
                  </button>
                  {page > 4 && showEllipsis && (
                    <span className="px-2 text-slate-400">...</span>
                  )}
                </>
              )}

              {/* Página anterior */}
                        <button
                            onClick={() => go(page - 1)}
                            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            disabled={page <= 1}
                            aria-label="Página anterior"
                            title="Página anterior"
                          >
                            <ChevronLeft size={16} />
                          </button>

              {/* Números de página */}
              <div className="flex items-center gap-1">
                {pageNumbers.map((num) => (
                  <button
                    key={num}
                    onClick={() => go(num)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                      num === page
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                    aria-current={num === page ? "page" : undefined}
                    aria-label={`Página ${num}`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Página siguiente */}
                        <button
                            onClick={() => go(page + 1)}
                            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            disabled={page >= totalPages}
                            aria-label="Página siguiente"
                            title="Página siguiente"
                          >
                            <ChevronRight size={16} />
                          </button>

              {/* Última página */}
              {showFirstLast && (
                <>
                  {page < totalPages - 3 && showEllipsis && (
                    <span className="px-2 text-slate-400">...</span>
                  )}
                  <button
                    onClick={() => go(totalPages)}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={page >= totalPages}
                    aria-label="Última página"
                    title="Última página"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
