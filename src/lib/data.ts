import { redirect } from "next/navigation";
import { env } from "./env";
import { getToken } from "./session";

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

export interface User {
  id: string;
  email: string;
  name: string;
  /** Can create organizations and manage the role catalogue. */
  isApplicationAdmin: boolean;
}

export type Gender = "Male" | "Female" | "Other" | "Prefer not to say";
/** A member's role in one organization. Organization admins edit it and manage its members. */
export type MemberRole = "Organization Admin" | "Member";

/** A member of the current organization. Profile fields are null for accounts created by sign-up. */
export interface Member {
  id: string;
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  gender: Gender | null;
  phoneNumber: string | null;
  address: string | null;
  role: MemberRole;
}

/** An entry in the global role catalogue, which application admins manage. */
export interface Role {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
}

export type EntityType =
  | "Sole Proprietorship"
  | "Partnership"
  | "LLC"
  | "Corporation"
  | "Non-Profit"
  | "Government"
  | "Other";
export type OrganizationStatus = "Pending" | "Active" | "Suspended" | "Dissolved";

/** An organization's core details. Optional fields are null when not set. Show it with `organizationName()`. */
export interface Organization {
  id: string;
  legalName: string;
  tradeName: string | null;
  entityType: EntityType | null;
  /** NAICS, SIC or NACE code. */
  industryCode: string | null;
  businessPurpose: string | null;
  dateOfIncorporation: string | null;
  contactEmail: string | null;
  contactNumber: string | null;
  address: string | null;
  /** Month (1-12) in which the financial year ends. */
  fiscalYearEndMonth: number | null;
  status: OrganizationStatus;
  isActive: boolean;
}

/** The signed-in user, the organization their token works in and their role there, and every organization they belong to. */
export interface Session {
  user: User;
  organization: Organization;
  role: MemberRole;
  organizations: Organization[];
}

/** What the API returns when it issues a token (login, signup, switching or creating an organization). */
export interface TokenResponse extends Session {
  token: string;
  expiresAt: string;
}

export class ApiError extends Error {
  /** Field-level validation messages from a 400 problem+json response. */
  readonly errors?: Record<string, string>;

  constructor(
    message: string,
    readonly status?: number,
    options?: ErrorOptions & { errors?: Record<string, string> },
  ) {
    super(message, options);
    this.name = "ApiError";
    this.errors = options?.errors;
  }
}

interface Problem {
  detail?: string;
  errors?: Record<string, string>;
}

type Init = { method?: string; body?: unknown; auth?: boolean };

/**
 * Calls the audit-service API with the session's token. A 401 means the session expired or was revoked,
 * so it redirects to /login. An unreachable API throws ApiError without a status.
 */
async function call(path: string, { method = "GET", body, auth = true }: Init = {}): Promise<Response> {
  if (!env.apiBaseUrl) {
    throw new ApiError("NEXT_PUBLIC_API_BASE_URL is not set");
  }
  const url = `${env.apiBaseUrl.replace(/\/+$/, "")}${path}`;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = auth ? await getToken() : undefined;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    // Data changes outside this app, so always read it fresh.
    res = await fetch(url, {
      method,
      cache: "no-store",
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    throw new ApiError(`Could not reach the audit API at ${url}`, undefined, { cause });
  }
  if (res.status === 401 && auth) redirect("/login");
  return res;
}

async function failure(res: Response, label: string): Promise<ApiError> {
  const problem = (await res.json().catch(() => ({}))) as Problem;
  return new ApiError(problem.detail ?? `${label} failed with ${res.status}`, res.status, { errors: problem.errors });
}

/** GETs a path. Returns null for 404 so callers can show notFound(). */
async function request<T>(path: string): Promise<T | null> {
  const res = await call(path);
  if (res.status === 404) return null;
  if (!res.ok) throw await failure(res, `GET ${path}`);
  return (await res.json()) as T;
}

async function requestList<T>(path: string): Promise<T[]> {
  return (await request<T[]>(path)) ?? [];
}

/**
 * Sends a change and returns the JSON response (nothing for 204). Throws ApiError with the API's problem
 * detail, including for 404, so Server Actions can show it. Pass auth=false for login and signup.
 */
export async function send<T = void>(method: string, path: string, body?: unknown, auth = true): Promise<T> {
  const res = await call(path, { method, body, auth });
  if (!res.ok) throw await failure(res, `${method} ${path}`);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export async function getSession(): Promise<Session> {
  const session = await request<Session>("/auth/me");
  if (!session) redirect("/login");
  return session;
}

/** The current organization's details. */
export async function getOrganization(): Promise<Organization> {
  const organization = await request<Organization>("/organization");
  if (!organization) redirect("/login");
  return organization;
}

export function getMembers(): Promise<Member[]> {
  return requestList<Member>("/organization/members");
}

export function getRoles(): Promise<Role[]> {
  return requestList<Role>("/roles");
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
