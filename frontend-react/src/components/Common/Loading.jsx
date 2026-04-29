export function Loading({ label = 'Загрузка…' }) {
  return (
    <div className="flex items-center justify-center py-12 text-slate-500 text-sm">{label}</div>
  );
}
