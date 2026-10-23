"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Audit, AuditStatus } from "@/lib/data";
import { formatDate, statusStyles } from "@/lib/utils";
import { Badge } from "./Badge";
import { ProgressBar } from "./ProgressBar";

const statuses: Array<AuditStatus | "All"> = ["All", "Planned", "In Progress", "In Review", "Completed"];

export function filterAudits(audits: Audit[], query: string, status: AuditStatus | "All"): Audit[] {
  const q = query.trim().toLowerCase();
  return audits.filter(
    (a) =>
      (status === "All" || a.status === status) &&
      (!q || [a.id, a.title, a.department, a.auditor].some((v) => v.toLowerCase().includes(q))),
  );
}

export function AuditList({ audits }: { audits: Audit[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AuditStatus | "All">("All");
  const rows = useMemo(() => filterAudits(audits, query, status), [audits, query, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search audits…"
          aria-label="Search audits"
          className="input sm:max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as AuditStatus | "All")}
          aria-label="Filter by status"
          className="input sm:w-44"
        >
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {rows.length === 0 && <p className="card p-6 text-center text-sm text-muted">No audits match your filters.</p>}

      {/* Cards: phones and small tablets */}
      <ul className="grid gap-3 sm:grid-cols-2 md:hidden">
        {rows.map((a) => (
          <li key={a.id}>
            <Link href={`/audits/${a.id}`} className="card block space-y-3 p-4 hover:border-brand">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted">{a.id}</p>
                  <p className="font-medium">{a.title}</p>
                </div>
                <Badge className={statusStyles[a.status]}>{a.status}</Badge>
              </div>
              <p className="text-sm text-muted">
                {a.department} · {a.auditor}
              </p>
              <ProgressBar value={a.progress} />
            </Link>
          </li>
        ))}
      </ul>

      {/* Table: tablets landscape and up */}
      {rows.length > 0 && (
        <div className="card hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Audit</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Auditor</th>
                <th className="hidden px-4 py-3 font-medium xl:table-cell">Period</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="w-40 px-4 py-3 font-medium">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                  <td className="px-4 py-3">
                    <Link href={`/audits/${a.id}`} className="font-medium hover:text-brand">
                      {a.title}
                    </Link>
                    <p className="text-xs text-muted">{a.id}</p>
                  </td>
                  <td className="px-4 py-3">{a.department}</td>
                  <td className="hidden px-4 py-3 lg:table-cell">{a.auditor}</td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-muted xl:table-cell">
                    {formatDate(a.startDate)} – {formatDate(a.endDate)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={statusStyles[a.status]}>{a.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <ProgressBar value={a.progress} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
