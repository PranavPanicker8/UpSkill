export function ProgressBar({
  value,
  label = true,
  size = "md",
}: {
  value: number;
  label?: boolean;
  size?: "sm" | "md";
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const isComplete = clamped === 100;
  const height = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/70 ${height}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isComplete ? "bg-emerald-600" : "bg-indigo-600"
          }`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {label && (
        <span
          className={`text-xs font-semibold tabular-nums ${
            isComplete ? "text-emerald-700" : "text-slate-700"
          }`}
        >
          {clamped}%
        </span>
      )}
    </div>
  );
}
