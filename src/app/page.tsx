import Link from "next/link";
import { AuditList } from "@/components/AuditList";
import { FindingList } from "@/components/FindingList";
import { StatCard } from "@/components/StatCard";
import { audits, findings } from "@/lib/data";

export default function DashboardPage() {
  const active = audits.filter((a) => a.status === "In Progress" || a.status === "In Review").length;
  const completed = audits.filter((a) => a.status === "Completed").length;
  const open = findings.filter((f) => !f.resolved);
  const critical = open.filter((f) => f.severity === "Critical" || f.severity === "High").length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Overview of audits and open findings.</p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-label="Key metrics">
        <StatCard label="Total audits" value={audits.length} />
        <StatCard label="Active" value={active} hint="In progress or review" />
        <StatCard label="Completed" value={completed} />
        <StatCard label="Open high-risk" value={critical} hint={`${open.length} open findings`} />
      </section>

      <div className="grid gap-6 2xl:grid-cols-[2fr_1fr]">
        <section className="min-w-0 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent audits</h2>
            <Link href="/audits" className="text-sm font-medium text-brand">
              View all
            </Link>
          </div>
          <AuditList audits={audits.slice(0, 4)} />
        </section>
        <section className="min-w-0 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Open findings</h2>
            <Link href="/findings" className="text-sm font-medium text-brand">
              View all
            </Link>
          </div>
          <FindingList findings={open.slice(0, 4)} />
        </section>
      </div>
    </div>
  );
}
