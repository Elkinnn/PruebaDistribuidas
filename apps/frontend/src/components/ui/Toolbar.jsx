export default function Toolbar({ title, subtitle, children }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
      {children && <div className="mt-4 flex justify-end">{children}</div>}
    </div>
  );
}
