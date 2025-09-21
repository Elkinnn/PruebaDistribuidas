import Modal from "./Modal";

export default function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title = "Confirmar",
    message,
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    tone = "danger", 
}) {
    const confirmClasses =
        tone === "danger"
            ? "bg-rose-600 hover:bg-rose-700"
            : "bg-emerald-600 hover:bg-emerald-700";

    return (
        <Modal
            open={open}
            onClose={onClose}       // <- importante para que la X y el overlay cierren
            title={title}
            size="sm"               // <- más pequeño
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}  // <- cancelar cierra
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm} // el padre cierra al terminar
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
