import { env } from "./env";

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

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ApiError";
  }
}

/** GETs a path from the audit-service API. Returns null for 404 so callers can show notFound(). */
async function request<T>(path: string): Promise<T | null> {
  if (!env.apiBaseUrl) {
    throw new ApiError("NEXT_PUBLIC_API_BASE_URL is not set");
  }
  const url = `${env.apiBaseUrl.replace(/\/+$/, "")}${path}`;
  let res: Response;
  try {
    // Data changes outside this app, so always read it fresh.
    res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
  } catch (cause) {
    throw new ApiError(`Could not reach the audit API at ${url}`, undefined, { cause });
  }
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new ApiError(`GET ${path} failed with ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}

async function requestList<T>(path: string): Promise<T[]> {
  return (await request<T[]>(path)) ?? [];
}

export function getAudits(): Promise<Audit[]> {
  return requestList<Audit>("/audits");
}

export function getAudit(id: string): Promise<Audit | null> {
  return request<Audit>(`/audits/${encodeURIComponent(id)}`);
}

export function getFindings(): Promise<Finding[]> {
  return requestList<Finding>("/findings");
}

export function getFindingsForAudit(auditId: string): Promise<Finding[]> {
  return requestList<Finding>(`/audits/${encodeURIComponent(auditId)}/findings`);
}
