import type { AuditStatus, EntityType, Organization, OrganizationStatus, Severity } from "./data";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Semantic colour tones defined in globals.css. Class names are written out in
// full so Tailwind can find them.
export type Tone = "neutral" | "info" | "review" | "success" | "warning" | "caution" | "danger";

export const toneStyles: Record<Tone, string> = {
  neutral: "bg-neutral-soft text-neutral-fg",
  info: "bg-info-soft text-info-fg",
  review: "bg-review-soft text-review-fg",
  success: "bg-success-soft text-success-fg",
  warning: "bg-warning-soft text-warning-fg",
  caution: "bg-caution-soft text-caution-fg",
  danger: "bg-danger-soft text-danger-fg",
};

export const statusTone: Record<AuditStatus, Tone> = {
  Planned: "neutral",
  "In Progress": "info",
  "In Review": "review",
  Completed: "success",
};

// Severity escalates neutral -> amber -> orange -> red.
export const severityTone: Record<Severity, Tone> = {
  Low: "neutral",
  Medium: "warning",
  High: "caution",
  Critical: "danger",
};

export const organizationStatusTone: Record<OrganizationStatus, Tone> = {
  Pending: "warning",
  Active: "success",
  Suspended: "caution",
  Dissolved: "neutral",
};

export const entityTypes: EntityType[] = [
  "Sole Proprietorship",
  "Partnership",
  "LLC",
  "Corporation",
  "Non-Profit",
  "Government",
  "Other",
];

export const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** The name people know an organization by: its trade name if it has one, otherwise its legal name. */
export function organizationName(o: Pick<Organization, "legalName" | "tradeName">): string {
  return o.tradeName?.trim() || o.legalName;
}

export const statusStyles = Object.fromEntries(
  Object.entries(statusTone).map(([k, t]) => [k, toneStyles[t]]),
) as Record<AuditStatus, string>;

export const severityStyles = Object.fromEntries(
  Object.entries(severityTone).map(([k, t]) => [k, toneStyles[t]]),
) as Record<Severity, string>;
