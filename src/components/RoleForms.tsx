"use client";

import { useActionState, useEffect, useRef } from "react";
import { createRole, deleteRole, type FormState } from "@/lib/actions";
import { Field, FormError, SubmitButton } from "./FormControls";

const initial: FormState = {};

export function CreateRoleForm() {
  const [state, action, pending] = useActionState(createRole, initial);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) form.current?.reset();
  }, [state]);

  return (
    <form ref={form} action={action} className="space-y-3">
      <FormError message={state.error} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <Field label="Name" name="name" required maxLength={50} error={state.fieldErrors?.name} className="sm:w-48" />
        <Field
          label="Description"
          name="description"
          maxLength={2000}
          error={state.fieldErrors?.description}
          className="flex-1"
        />
        <SubmitButton pending={pending} className="sm:mt-7">
          {pending ? "Creating…" : "Create role"}
        </SubmitButton>
      </div>
      <p className="text-xs text-muted">Names are stored in capitals and must be unique.</p>
    </form>
  );
}

export function DeleteRoleButton({ id, name }: { id: number; name: string }) {
  const [state, action, pending] = useActionState(deleteRole, initial);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(`Delete the role ${name}?`)) e.preventDefault();
      }}
      className="text-right"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-danger-fg hover:bg-danger-soft disabled:opacity-60"
      >
        Delete
      </button>
      {state.error && (
        <p role="alert" className="mt-1 text-xs text-danger-fg">
          {state.error}
        </p>
      )}
    </form>
  );
}
