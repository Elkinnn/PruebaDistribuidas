export default function Input({ label, error, className = "", ...props }) {
    return (
        <label className="grid gap-1.5">
            {label && (
                <span className="text-sm font-medium text-slate-700">{label}</span>
            )}
            <input
                className={
                    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm " +
                    "placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 " +
                    "focus:border-emerald-500 " +
                    className
                }
                {...props}
            />
            {error ? (
                <span className="text-xs text-rose-600">{error}</span>
            ) : null}
        </label>
    );
}
