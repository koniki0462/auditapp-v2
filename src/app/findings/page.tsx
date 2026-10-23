import type { Metadata } from "next";
import { FindingList } from "@/components/FindingList";
import { findings } from "@/lib/data";

export const metadata: Metadata = { title: "Findings" };

export default function FindingsPage() {
  const open = findings.filter((f) => !f.resolved);
  const resolved = findings.filter((f) => f.resolved);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Findings</h1>
        <p className="mt-1 text-sm text-muted">
          {open.length} open · {resolved.length} resolved
        </p>
      </div>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Open</h2>
        <FindingList findings={open} />
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Resolved</h2>
        <FindingList findings={resolved} />
      </section>
    </div>
  );
}
