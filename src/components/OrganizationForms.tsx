"use client";

import { useActionState, useEffect, useRef } from "react";
import { addMember, createOrganization, removeMember, updateOrganization, type FormState } from "@/lib/actions";
import type { Organization } from "@/lib/data";
import { entityTypes, monthNames } from "@/lib/utils";
import { Field, FormError, SelectField, SubmitButton, TextAreaField } from "./FormControls";

const initial: FormState = {};

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
        <SubmitButton pending={pending} className="sm:mt-7">
          {pending ? "Creating…" : "Create and switch"}
        </SubmitButton>
      </div>
    </form>
  );
}
