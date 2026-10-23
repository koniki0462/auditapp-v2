"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type FormState } from "@/lib/actions";
import { Field, FormError, SubmitButton } from "./FormControls";

const initial: FormState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, initial);
  return (
    <form action={action} className="card space-y-4 p-6">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <FormError message={state.error} />
      <input type="hidden" name="next" value={next ?? "/"} />
      <Field label="Email" name="email" type="email" autoComplete="email" required error={state.fieldErrors?.email} />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />
      <SubmitButton pending={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-brand">
          Create an organization
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, initial);
  const errors = state.fieldErrors;
  return (
    <form action={action} className="card space-y-4 p-6">
      <div>
        <h1 className="text-xl font-semibold">Create your organization</h1>
        <p className="mt-1 text-sm text-muted">You can invite your team once you&apos;re in.</p>
      </div>
      <FormError message={state.error} />
      <Field
        label="Organization legal name"
        name="organizationLegalName"
        required
        error={errors?.organizationLegalName}
      />
      <Field label="Your name" name="name" autoComplete="name" required error={errors?.name} />
      <Field label="Work email" name="email" type="email" autoComplete="email" required error={errors?.email} />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        maxLength={72}
        required
        error={errors?.password}
      />
      <SubmitButton pending={pending} className="w-full">
        {pending ? "Creating…" : "Create organization"}
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand">
          Sign in
        </Link>
      </p>
    </form>
  );
}
