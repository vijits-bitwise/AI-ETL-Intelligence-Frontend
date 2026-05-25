export default function Loader() {
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />
      <p className="text-sm font-medium text-slate-500">Analyzing incident…</p>
    </div>
  );
}
