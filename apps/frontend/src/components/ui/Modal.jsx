export default function Modal({ open, onClose, children, width = "max-w-md" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30">
      <div className={`w-full ${width} rounded-2xl bg-white shadow-xl ring-1 ring-slate-200`}>
        <div className="flex justify-end p-3">
          <button onClick={onClose} className="rounded-lg px-2 text-slate-500 hover:bg-slate-100">✕</button>
        </div>
        <div className="px-5 pb-6">{children}</div>
      </div>
    </div>
  );
}
