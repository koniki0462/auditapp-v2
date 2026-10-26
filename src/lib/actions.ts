"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { safeNextPath } from "./auth";
import { ApiError, send, type TokenResponse } from "./data";
import { clearToken, setToken } from "./session";

/** Returned by form actions so the form can show what went wrong. */
export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
}

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

function optional(form: FormData, name: string): string | null {
  const value = field(form, name).trim();
  return value === "" ? null : value;
}

// Not exported: every export of a "use server" file becomes a callable Server Action.
/** The organization details fields of a form, with blanks sent as null so the API clears them. */
function organizationDetails(form: FormData) {
  const month = optional(form, "fiscalYearEndMonth");
  return {
    legalName: field(form, "legalName"),
    tradeName: optional(form, "tradeName"),
    entityType: optional(form, "entityType"),
    industryCode: optional(form, "industryCode"),
    businessPurpose: optional(form, "businessPurpose"),
    dateOfIncorporation: optional(form, "dateOfIncorporation"),
    contactEmail: optional(form, "contactEmail"),
    contactNumber: optional(form, "contactNumber"),
    address: optional(form, "address"),
    fiscalYearEndMonth: month === null ? null : Number(month),
  };
}

function toFormState(e: unknown): FormState {
  if (e instanceof ApiError) {
    if (e.status === undefined) return { error: "The audit service is unavailable. Try again in a moment." };
    return { error: e.errors ? "Please fix the highlighted fields." : e.message, fieldErrors: e.errors };
  }
  throw e;
}

/** Stores a newly issued token and opens the app at `next`. */
async function startSession(tokens: TokenResponse, next: string): Promise<never> {
  await setToken(tokens.token, tokens.expiresAt);
  revalidatePath("/", "layout");
  redirect(safeNextPath(next));
}

export async function login(_: FormState, form: FormData): Promise<FormState> {
  let tokens: TokenResponse;
  try {
    tokens = await send<TokenResponse>(
      "POST",
      "/auth/login",
      { email: field(form, "email"), password: field(form, "password") },
      false,
    );
  } catch (e) {
    return toFormState(e);
  }
  return startSession(tokens, field(form, "next"));
}

export async function signup(_: FormState, form: FormData): Promise<FormState> {
  let tokens: TokenResponse;
  try {
    tokens = await send<TokenResponse>(
      "POST",
      "/auth/signup",
      {
        name: field(form, "name"),
        email: field(form, "email"),
        password: field(form, "password"),
        organizationLegalName: field(form, "organizationLegalName"),
      },
      false,
    );
  } catch (e) {
    return toFormState(e);
  }
  return startSession(tokens, "/");
}

export async function logout(): Promise<never> {
  await clearToken();
  redirect("/login");
}

export async function switchOrganization(form: FormData): Promise<void> {
  const tokens = await send<TokenResponse>("POST", "/auth/switch", { organizationId: field(form, "organizationId") });
  await startSession(tokens, "/");
}

export async function createOrganization(_: FormState, form: FormData): Promise<FormState> {
  let tokens: TokenResponse;
  try {
    tokens = await send<TokenResponse>("POST", "/organizations", organizationDetails(form));
  } catch (e) {
    return toFormState(e);
  }
  return startSession(tokens, "/organization");
}

/** Replaces the current organization's details. Status and active flag are not editable. */
export async function updateOrganization(_: FormState, form: FormData): Promise<FormState> {
  try {
    await send("PUT", "/organization", organizationDetails(form));
  } catch (e) {
    return toFormState(e);
  }
  // The name also shows in the sidebar and switcher.
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Creates an account with a profile and initial password, and adds it to the current organization. */
export async function createMember(_: FormState, form: FormData): Promise<FormState> {
  try {
    await send("POST", "/organization/members", {
      firstName: field(form, "firstName"),
      lastName: field(form, "lastName"),
      gender: optional(form, "gender"),
      email: field(form, "email"),
      phoneNumber: field(form, "phoneNumber"),
      address: field(form, "address"),
      password: field(form, "password"),
      role: optional(form, "role"),
    });
  } catch (e) {
    return toFormState(e);
  }
  revalidatePath("/organization");
  return { ok: true };
}

/** Adds an existing account, by email, to the current organization. */
export async function addMember(_: FormState, form: FormData): Promise<FormState> {
  try {
    await send("POST", "/organization/members/existing", { email: field(form, "email"), role: optional(form, "role") });
  } catch (e) {
    return toFormState(e);
  }
  revalidatePath("/organization");
  return { ok: true };
}

/** Changing your own role changes what the shell shows, so this revalidates the whole layout. */
export async function changeMemberRole(_: FormState, form: FormData): Promise<FormState> {
  try {
    await send("PATCH", `/organization/members/${encodeURIComponent(field(form, "userId"))}`, {
      role: field(form, "role"),
    });
  } catch (e) {
    return toFormState(e);
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Removes a member. Leaving (self=true) revokes the current token too, so it signs the user out. */
export async function removeMember(_: FormState, form: FormData): Promise<FormState> {
  try {
    await send("DELETE", `/organization/members/${encodeURIComponent(field(form, "userId"))}`);
  } catch (e) {
    return toFormState(e);
  }
  if (field(form, "self") === "true") return logout();
  revalidatePath("/organization");
  return { ok: true };
}

/** Application admins only: adds a role to the global catalogue. */
export async function createRole(_: FormState, form: FormData): Promise<FormState> {
  try {
    await send("POST", "/roles", { name: field(form, "name"), description: optional(form, "description") });
  } catch (e) {
    return toFormState(e);
  }
  revalidatePath("/roles");
  return { ok: true };
}

export async function deleteRole(_: FormState, form: FormData): Promise<FormState> {
  try {
    await send("DELETE", `/roles/${encodeURIComponent(field(form, "id"))}`);
  } catch (e) {
    return toFormState(e);
  }
  revalidatePath("/roles");
  return { ok: true };
}
