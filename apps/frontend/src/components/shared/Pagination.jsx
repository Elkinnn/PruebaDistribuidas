import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, pageSize, total, onChange }) {
    const safePageSize = pageSize || 1;
    const totalPages = Math.max(1, Math.ceil(total / safePageSize));

    function go(p) {
        const next = Math.min(Math.max(1, p), totalPages);
        if (next !== page) onChange(next);
    }

    // Números (máx 5)
    const nums = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + 4);
    // reajuste para que siempre sean 5 si se puede
    start = Math.max(1, Math.min(start, end - 4));
    for (let i = start; i <= end; i++) nums.push(i);

    return (
        // Barra sticky al fondo del contenedor de la página
        <nav
            aria-label="Paginación"
            className="
        sticky bottom-0 z-20 mt-6 -mx-4 md:mx-0
        border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60
        px-4 py-3
      "
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm">
                {/* Texto (oculto en móviles para ahorrar espacio) */}
                <p className="hidden sm:block text-slate-600">
                    Página <b>{page}</b> de <b>{totalPages}</b> — {total} registros
                </p>

                {/* Controles */}
                <div className="flex items-center justify-between sm:justify-end w-full gap-2">
                    {/* Indicador compacto en móvil */}
                    <span className="sm:hidden text-slate-600">
                        {page} / {totalPages}
                    </span>

                    <div className="ml-auto flex items-center gap-1">
                        <button
                            onClick={() => go(page - 1)}
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                            disabled={page <= 1}
                            title="Anterior"
                            aria-label="Anterior"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {/* Números (solo ≥ sm) */}
                        <div className="hidden sm:flex items-center gap-1">
                            {nums.map((n) => (
                                <button
                                    key={n}
                                    onClick={() => go(n)}
                                    aria-current={n === page ? "page" : undefined}
                                    className={`rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-200
                    ${n === page
                                            ? "bg-emerald-600 text-white"
                                            : "text-slate-700 hover:bg-slate-100"
                                        }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => go(page + 1)}
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                            disabled={page >= totalPages}
                            title="Siguiente"
                            aria-label="Siguiente"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
