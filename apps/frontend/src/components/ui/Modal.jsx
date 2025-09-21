import { X } from "lucide-react";
import { useEffect } from "react";

const SIZE = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
};

export default function Modal({
    open,
    onClose,
    title,
    children,
    footer,
    size = "md",
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose?.();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop: cierra al click */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Contenedor centrado (vertical y horizontal) */}
            <div className="relative z-10 flex min-h-full items-center justify-center p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    className={[
                        "w-full rounded-2xl bg-white shadow-xl ring-1 ring-slate-200",
                        "flex flex-col",             // para distribuir header/body/footer
                        "max-h-[85vh]",              // limita altura del modal
                        SIZE[size],
                    ].join(" ")}
                    onClick={(e) => e.stopPropagation()} // no cerrar si se hace click adentro
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                            aria-label="Cerrar"
                            title="Cerrar"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body (scroll interno si hace falta) */}
                    <div className="px-5 py-4 overflow-y-auto">{children}</div>

                    {/* Footer */}
                    {footer ? (
                        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
                            {footer}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
