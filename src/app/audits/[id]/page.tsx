import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { FindingList } from "@/components/FindingList";
import { ProgressBar } from "@/components/ProgressBar";
import { audits, getAudit, getFindingsForAudit } from "@/lib/data";
import { formatDate, statusStyles } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return audits.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: getAudit(id)?.title ?? "Audit not found" };
}

export default async function AuditDetailPage({ params }: Props) {
  const { id } = await params;
  const audit = getAudit(id);
  if (!audit) notFound();
  const auditFindings = getFindingsForAudit(audit.id);

  const details = [
    ["Department", audit.department],
    ["Lead auditor", audit.auditor],
    ["Start date", formatDate(audit.startDate)],
    ["End date", formatDate(audit.endDate)],
  ];

  return (
    <div className="space-y-6">
      <Link href="/audits" className="inline-flex items-center text-sm text-muted hover:text-brand">
        ← Back to audits
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted">{audit.id}</p>
          <h1 className="text-2xl font-semibold sm:text-3xl">{audit.title}</h1>
        </div>
        <Badge className={statusStyles[audit.status]}>{audit.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="card space-y-4 p-4 sm:p-6">
          <h2 className="font-semibold">Scope</h2>
          <p className="text-sm leading-relaxed">{audit.description}</p>
          <div>
            <p className="mb-2 text-sm text-muted">Progress</p>
            <ProgressBar value={audit.progress} />
          </div>
        </section>
        <dl className="card grid grid-cols-2 gap-4 p-4 sm:p-6 lg:grid-cols-1">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Findings ({auditFindings.length})</h2>
        <FindingList findings={auditFindings} showAudit={false} />
      </section>
    </div>
  );
}
