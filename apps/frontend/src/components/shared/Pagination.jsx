import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, pageSize, total, onChange }) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    function go(p) {
        const next = Math.min(Math.max(1, p), totalPages);
        if (next !== page) onChange(next);
    }

    // números simples (máx 5 botones)
    const nums = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) nums.push(i);

    return (
        <div className="flex items-center justify-between text-sm">
            <p className="text-slate-600">
                Página <b>{page}</b> de <b>{totalPages}</b> — {total} registros
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => go(page - 1)}
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                    disabled={page <= 1}
                    title="Anterior"
                >
                    <ChevronLeft size={16} />
                </button>
                {nums.map((n) => (
                    <button
                        key={n}
                        onClick={() => go(n)}
                        className={`rounded-lg px-3 py-1.5 ${n === page
                                ? "bg-emerald-600 text-white"
                                : "text-slate-700 hover:bg-slate-100"
                            }`}
                    >
                        {n}
                    </button>
                ))}
                <button
                    onClick={() => go(page + 1)}
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                    disabled={page >= totalPages}
                    title="Siguiente"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
