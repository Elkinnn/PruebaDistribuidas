export default function Logo({ className = "" }) {
    return (
        <div className={"flex items-center gap-2 " + className}>
            {/* Cruz médica simple */}
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                    <path
                        d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6V4z"
                        fill="currentColor"
                    />
                </svg>
            </div>
            <div className="leading-tight">
                <p className="text-base font-bold tracking-tight text-slate-800">
                    Clinix
                </p>
                <p className="text-[11px] uppercase tracking-widest text-slate-500">
                    Gestión Hospitalaria
                </p>
            </div>
        </div>
    );
}
