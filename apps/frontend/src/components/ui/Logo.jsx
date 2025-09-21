export default function Logo({ className = "" }) {
    return (
        <div className={"flex items-center gap-2 " + className}>
            {/* Cruz médica simple */}
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
