import type { Metadata } from "next";
import { AuditList } from "@/components/AuditList";
import { audits } from "@/lib/data";

export const metadata: Metadata = { title: "Audits" };

export default function AuditsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Audits</h1>
        <p className="mt-1 text-sm text-muted">{audits.length} audits across all departments.</p>
      </div>
      <AuditList audits={audits} />
    </div>
  );
}
