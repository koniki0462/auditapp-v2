import Link from "next/link";
import type { Finding } from "@/lib/data";
import { formatDate, severityStyles, toneStyles } from "@/lib/utils";
import { Badge } from "./Badge";

export function FindingList({ findings, showAudit = true }: { findings: Finding[]; showAudit?: boolean }) {
  if (findings.length === 0) {
    return <p className="card p-6 text-center text-sm text-muted">No findings recorded.</p>;
  }
  return (
    <ul className="card divide-y divide-line">
      {findings.map((f) => (
        <li key={f.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className={f.resolved ? "font-medium text-muted line-through" : "font-medium"}>{f.title}</p>
            <p className="mt-0.5 text-xs text-muted">
              {f.id}
              {showAudit && (
                <>
                  {" · "}
                  <Link href={`/audits/${f.auditId}`} className="hover:text-brand">
                    {f.auditId}
                  </Link>
                </>
              )}
              {" · "}
              {f.owner} · Due {formatDate(f.dueDate)}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className={severityStyles[f.severity]}>{f.severity}</Badge>
            <Badge className={f.resolved ? toneStyles.success : toneStyles.neutral}>
              {f.resolved ? "Resolved" : "Open"}
            </Badge>
          </div>
        </li>
      ))}
    </ul>
  );
}
