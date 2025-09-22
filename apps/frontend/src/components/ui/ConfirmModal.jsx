import Modal from "./Modal";

export default function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title = "Confirmar",
    message,
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    tone = "danger", // danger | primary
}) {
    const confirmClasses =
        tone === "danger"
            ? "bg-rose-600 hover:bg-rose-700"
            : "bg-emerald-600 hover:bg-emerald-700";

    return (
        <Modal
            open={open}
            onClose={onClose}   // overlay, ✕ y ESC cierran
            title={title}
            size="sm"           // modal compacto
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${confirmClasses}`}
                    >
                        {confirmText}
                    </button>
                </>
            }
        >
            <p className="leading-6 text-slate-700">{message}</p>
        </Modal>
    );
}
