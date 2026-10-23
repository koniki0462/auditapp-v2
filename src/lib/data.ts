export type AuditStatus = "Planned" | "In Progress" | "In Review" | "Completed";
export type Severity = "Low" | "Medium" | "High" | "Critical";

export interface Finding {
  id: string;
  auditId: string;
  title: string;
  severity: Severity;
  owner: string;
  dueDate: string;
  resolved: boolean;
}

export interface Audit {
  id: string;
  title: string;
  department: string;
  auditor: string;
  status: AuditStatus;
  startDate: string;
  endDate: string;
  progress: number;
  description: string;
}

export const audits: Audit[] = [
  {
    id: "AUD-1001",
    title: "Quarterly Financial Controls",
    department: "Finance",
    auditor: "Priya Sharma",
    status: "In Progress",
    startDate: "2026-10-01",
    endDate: "2026-10-31",
    progress: 65,
    description: "Review of journal entry approvals, reconciliations and segregation of duties.",
  },
  {
    id: "AUD-1002",
    title: "ISO 27001 Access Review",
    department: "IT Security",
    auditor: "Arjun Rao",
    status: "In Review",
    startDate: "2026-09-15",
    endDate: "2026-10-20",
    progress: 90,
    description: "User access recertification for production systems and privileged accounts.",
  },
  {
    id: "AUD-1003",
    title: "Vendor Onboarding Compliance",
    department: "Procurement",
    auditor: "Meera Iyer",
    status: "Planned",
    startDate: "2026-11-05",
    endDate: "2026-11-28",
    progress: 0,
    description: "Due diligence, contract terms and KYC checks for newly onboarded vendors.",
  },
  {
    id: "AUD-1004",
    title: "Payroll Process Audit",
    department: "HR",
    auditor: "Rahul Verma",
    status: "Completed",
    startDate: "2026-08-01",
    endDate: "2026-08-30",
    progress: 100,
    description: "Payroll calculation accuracy, statutory deductions and master data changes.",
  },
  {
    id: "AUD-1005",
    title: "Warehouse Inventory Count",
    department: "Operations",
    auditor: "Kavya Nair",
    status: "In Progress",
    startDate: "2026-10-10",
    endDate: "2026-11-10",
    progress: 40,
    description: "Physical stock verification against ERP records across three warehouses.",
  },
  {
    id: "AUD-1006",
    title: "Data Privacy (DPDP) Readiness",
    department: "Legal",
    auditor: "Arjun Rao",
    status: "Completed",
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    progress: 100,
    description: "Consent management, data retention and breach notification procedures.",
  },
];

export const findings: Finding[] = [
  { id: "F-201", auditId: "AUD-1001", title: "Manual journals posted without second approval", severity: "High", owner: "Finance Controller", dueDate: "2026-11-15", resolved: false },
  { id: "F-202", auditId: "AUD-1001", title: "Bank reconciliation delayed by 12 days", severity: "Medium", owner: "Treasury", dueDate: "2026-11-05", resolved: false },
  { id: "F-203", auditId: "AUD-1002", title: "Terminated users with active VPN access", severity: "Critical", owner: "IT Ops", dueDate: "2026-10-25", resolved: false },
  { id: "F-204", auditId: "AUD-1002", title: "Shared admin account on database server", severity: "High", owner: "DBA Team", dueDate: "2026-11-01", resolved: true },
  { id: "F-205", auditId: "AUD-1004", title: "Missing approval for salary revisions", severity: "Medium", owner: "HR Ops", dueDate: "2026-09-15", resolved: true },
  { id: "F-206", auditId: "AUD-1005", title: "Stock variance above 2% threshold", severity: "High", owner: "Warehouse Manager", dueDate: "2026-11-20", resolved: false },
  { id: "F-207", auditId: "AUD-1006", title: "Retention policy not applied to backups", severity: "Low", owner: "Legal", dueDate: "2026-08-30", resolved: true },
];

export function getAudit(id: string): Audit | undefined {
  return audits.find((a) => a.id === id);
}

export function getFindingsForAudit(auditId: string): Finding[] {
  return findings.filter((f) => f.auditId === auditId);
}
