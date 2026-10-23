import type { AuditStatus, Severity } from "./data";

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

export const statusStyles = Object.fromEntries(
  Object.entries(statusTone).map(([k, t]) => [k, toneStyles[t]]),
) as Record<AuditStatus, string>;

export const severityStyles = Object.fromEntries(
  Object.entries(severityTone).map(([k, t]) => [k, toneStyles[t]]),
) as Record<Severity, string>;
