"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  addMember,
  changeMemberRole,
  createMember,
  createOrganization,
  removeMember,
  updateOrganization,
  type FormState,
} from "@/lib/actions";
import type { MemberRole, Organization } from "@/lib/data";
import { entityTypes, genders, memberRoles, monthNames } from "@/lib/utils";
import { Field, FormError, SelectField, SubmitButton, TextAreaField } from "./FormControls";

const initial: FormState = {};
const roleOptions = memberRoles.map((r) => ({ value: r, label: r }));

/** Creates a new account with its profile and an initial password the admin passes on. */
export function CreateMemberForm() {
  const [state, action, pending] = useActionState(createMember, initial);
  const form = useRef<HTMLFormElement>(null);
  const errors = state.fieldErrors;
  useEffect(() => {
    if (state.ok) form.current?.reset();
  }, [state]);

  return (
    <form ref={form} action={action} className="space-y-4">
      <FormError message={state.error} />
      {state.ok && !pending && (
        <p role="status" className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success-fg">
          Member created. Give them their email and initial password to sign in.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" name="firstName" required maxLength={100} autoComplete="off" error={errors?.firstName} />
        <Field label="Last name" name="lastName" required maxLength={100} autoComplete="off" error={errors?.lastName} />
        <SelectField
          label="Gender"
          name="gender"
          required
          placeholder="Choose…"
          defaultValue=""
          options={genders.map((g) => ({ value: g, label: g }))}
          error={errors?.gender}
        />
        <Field label="Email" name="email" type="email" required maxLength={255} autoComplete="off" error={errors?.email} />
        <Field label="Phone number" name="phoneNumber" type="tel" required maxLength={30} error={errors?.phoneNumber} />
        <SelectField label="Role" name="role" defaultValue="Member" options={roleOptions} error={errors?.role} />
        <TextAreaField
          label="Address"
          name="address"
          required
          maxLength={1000}
          error={errors?.address}
          className="sm:col-span-2"
        />
        <Field
          label="Initial password"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          error={errors?.password}
        />
      </div>
      <SubmitButton pending={pending}>{pending ? "Creating…" : "Create member"}</SubmitButton>
    </form>
  );
}

export function AddMemberForm() {
  const [state, action, pending] = useActionState(addMember, initial);
  const form = useRef<HTMLFormElement>(null);
  // Clear the email after a successful add so the next one starts empty.
  useEffect(() => {
    if (state.ok) form.current?.reset();
  }, [state]);

  return (
    <form ref={form} action={action} className="space-y-3">
      <FormError message={state.error} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <Field
          label="Email"
          name="email"
          type="email"
          required
          placeholder="colleague@company.com"
          error={state.fieldErrors?.email}
          className="flex-1"
        />
        <SubmitButton pending={pending} className="sm:mt-7">
          {pending ? "Adding…" : "Add member"}
        </SubmitButton>
      </div>
      <p className="text-xs text-muted">They need an account first: ask them to sign up, then add their email here.</p>
    </form>
  );
}

/** Changes a member's role as soon as another one is picked. */
export function MemberRoleSelect({ userId, name, role }: { userId: string; name: string; role: MemberRole }) {
  const [state, action, pending] = useActionState(changeMemberRole, initial);
  const form = useRef<HTMLFormElement>(null);
  // A refused change (such as demoting the last admin) puts the select back on the saved role.
  useEffect(() => {
    if (state.error) form.current?.reset();
  }, [state]);
  return (
    <form ref={form} action={action}>
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={role}
        disabled={pending}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        aria-label={`Role of ${name}`}
        className="input w-auto py-1.5 text-sm"
      >
        {memberRoles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {state.error && (
        <p role="alert" className="mt-1 text-xs text-danger-fg">
          {state.error}
        </p>
      )}
    </form>
  );
}

export function RemoveMemberButton({ userId, name, isSelf }: { userId: string; name: string; isSelf: boolean }) {
  const [state, action, pending] = useActionState(removeMember, initial);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        const question = isSelf
          ? "Leave this organization? You'll lose access to its audits and be signed out."
          : `Remove ${name} from this organization?`;
        if (!window.confirm(question)) e.preventDefault();
      }}
      className="text-right"
    >
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="self" value={String(isSelf)} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-danger-fg hover:bg-danger-soft disabled:opacity-60"
      >
        {isSelf ? "Leave" : "Remove"}
      </button>
      {state.error && (
        <p role="alert" className="mt-1 text-xs text-danger-fg">
          {state.error}
        </p>
      )}
    </form>
  );
}

/** Edits the current organization's core details. Status and active flag are shown on the page, not edited. */
export function OrganizationDetailsForm({ organization: o }: { organization: Organization }) {
  const [state, action, pending] = useActionState(updateOrganization, initial);
  const errors = state.fieldErrors;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="space-y-4">
      <FormError message={state.error} />
      {state.ok && !pending && (
        <p role="status" className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success-fg">
          Details saved.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Legal name" name="legalName" required maxLength={255} defaultValue={o.legalName} error={errors?.legalName} />
        <Field
          label="Trade name (DBA)"
          name="tradeName"
          maxLength={255}
          defaultValue={o.tradeName ?? ""}
          error={errors?.tradeName}
        />
        <SelectField
          label="Entity type"
          name="entityType"
          placeholder="Not set"
          defaultValue={o.entityType ?? ""}
          options={entityTypes.map((t) => ({ value: t, label: t }))}
          error={errors?.entityType}
        />
        <Field
          label="Industry code (NAICS / SIC / NACE)"
          name="industryCode"
          maxLength={20}
          defaultValue={o.industryCode ?? ""}
          error={errors?.industryCode}
        />
        <Field
          label="Date of incorporation"
          name="dateOfIncorporation"
          type="date"
          max={today}
          defaultValue={o.dateOfIncorporation ?? ""}
          error={errors?.dateOfIncorporation}
        />
        <SelectField
          label="Fiscal year ends in"
          name="fiscalYearEndMonth"
          placeholder="Not set"
          defaultValue={o.fiscalYearEndMonth?.toString() ?? ""}
          options={monthNames.map((m, i) => ({ value: String(i + 1), label: m }))}
          error={errors?.fiscalYearEndMonth}
        />
        <Field
          label="Contact email"
          name="contactEmail"
          type="email"
          maxLength={255}
          defaultValue={o.contactEmail ?? ""}
          error={errors?.contactEmail}
        />
        <Field
          label="Contact number"
          name="contactNumber"
          type="tel"
          maxLength={30}
          defaultValue={o.contactNumber ?? ""}
          error={errors?.contactNumber}
        />
        <TextAreaField
          label="Address"
          name="address"
          maxLength={1000}
          defaultValue={o.address ?? ""}
          error={errors?.address}
          className="sm:col-span-2"
        />
        <TextAreaField
          label="Business purpose"
          name="businessPurpose"
          maxLength={4000}
          defaultValue={o.businessPurpose ?? ""}
          error={errors?.businessPurpose}
          className="sm:col-span-2"
        />
      </div>
      <SubmitButton pending={pending}>{pending ? "Saving…" : "Save details"}</SubmitButton>
    </form>
  );
}

export function CreateOrganizationForm() {
  const [state, action, pending] = useActionState(createOrganization, initial);
  return (
    <form action={action} className="space-y-3">
      <FormError message={state.error} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <Field label="Legal name" name="legalName" required error={state.fieldErrors?.legalName} className="flex-1" />
        <Field
          label="Contact email"
          name="contactEmail"
          type="email"
          maxLength={255}
          error={state.fieldErrors?.contactEmail}
          className="flex-1"
        />
        <SubmitButton pending={pending} className="sm:mt-7">
          {pending ? "Creating…" : "Create and switch"}
        </SubmitButton>
      </div>
    </form>
  );
}
