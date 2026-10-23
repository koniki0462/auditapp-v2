import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  alert = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  alert?: boolean;
}) {
  return (
    <div className={cn("card p-4 sm:p-5", alert && "border-l-4 border-l-danger")}>
      <p className="text-sm text-muted">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums sm:text-3xl", alert && "text-danger-fg")}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
