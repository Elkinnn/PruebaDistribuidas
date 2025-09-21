export default function Card({ className = "", children, ...props }) {
    return (
        <div
            className={
                "rounded-2xl bg-white/95 shadow-lg ring-1 ring-slate-200/80 " + className
            }
            {...props}
        >
            {children}
        </div>
    );
}
