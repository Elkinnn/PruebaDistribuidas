import { X } from "lucide-react";
import { useEffect, useId } from "react";

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
    const titleId = useId();
    const widthClass = SIZE[size] ?? SIZE.md;

    // Cerrar con ESC
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose?.();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    // Bloquear scroll del body cuando está abierto
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Contenedor centrado */}
            <div className="relative z-10 flex min-h-full items-center justify-center p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    className={[
                        "w-full rounded-2xl bg-white shadow-xl ring-1 ring-slate-200",
                        "flex flex-col",
                        "max-h-[85vh]",
                        widthClass,
                    ].join(" ")}
                    onClick={(e) => e.stopPropagation()} // No cerrar si se hace click adentro
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <h3 id={titleId} className="text-lg font-semibold text-slate-900">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                            aria-label="Cerrar"
                            title="Cerrar"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body (scroll interno) */}
                    <div className="overflow-y-auto px-5 py-4">{children}</div>

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
