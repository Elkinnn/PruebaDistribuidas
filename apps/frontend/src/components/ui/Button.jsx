export default function Button({
    as: Tag = "button",
    className = "",
    loading = false,
    children,
    ...props
}) {
    return (
        <Tag
            className={
                "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium " +
                "shadow-sm ring-1 ring-inset ring-slate-300/60 " +
                "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 " +
                "disabled:opacity-60 disabled:cursor-not-allowed " +
                className
            }
            {...props}
        >
            {loading ? (
                <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                    Procesando…
                </>
            ) : (
                children
            )}
        </Tag>
    );
}
