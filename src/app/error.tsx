"use client";

import { isProduction } from "@/lib/env";

// Shown when a page fails to render, most often because the audit API is unreachable.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid place-items-center py-20 text-center">
      <h1 className="text-2xl font-semibold">Couldn&apos;t load data</h1>
      <p className="mt-2 text-sm text-muted">The audit service may be unavailable. Try again in a moment.</p>
      {/* Production builds replace server error messages with a digest, so only show details elsewhere. */}
      {!isProduction && <p className="mt-2 max-w-md text-xs text-muted">{error.message}</p>}
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-fg hover:bg-brand-hover"
      >
        Try again
      </button>
    </div>
  );
}
