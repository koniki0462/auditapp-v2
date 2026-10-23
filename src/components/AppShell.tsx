"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout, switchOrganization } from "@/lib/actions";
import type { Session } from "@/lib/data";
import { env, isProduction } from "@/lib/env";
import { cn, organizationName } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: "M3 12l9-9 9 9M5 10v10h14V10" },
  { href: "/audits", label: "Audits", icon: "M9 5h6M9 3h6a2 2 0 012 2v14a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2zm0 8h6m-6 4h4" },
  { href: "/findings", label: "Findings", icon: "M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" },
  { href: "/organization", label: "Organization", icon: "M17 20h5v-2a3 3 0 00-5.4-1.8M17 20H7m10 0v-2c0-.7-.1-1.3-.4-1.8M7 20H2v-2a3 3 0 015.4-1.8M7 20v-2c0-.7.1-1.3.4-1.8m0 0a5 5 0 019.2 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
];

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

/** Shows the current organization; with more than one, a select that switches by getting a new token. */
function OrganizationSwitcher({ session }: { session: Session }) {
  if (session.organizations.length < 2) {
    return <p className="truncate px-1 text-sm font-medium">{organizationName(session.organization)}</p>;
  }
  return (
    <form action={switchOrganization}>
      <select
        name="organizationId"
        defaultValue={session.organization.id}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        aria-label="Switch organization"
        className="input"
      >
        {session.organizations.map((o) => (
          <option key={o.id} value={o.id}>
            {organizationName(o)}
          </option>
        ))}
      </select>
    </form>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export function AppShell({ session, children }: { session: Session; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Mobile overlay */}
      <div
        className={cn("fixed inset-0 z-30 bg-overlay transition-opacity lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-surface transition-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center gap-2 border-b border-line px-5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-bold text-brand-fg">A</span>
          <span className="text-lg font-semibold">AuditApp</span>
        </div>
        <div className="space-y-1 border-b border-line p-3">
          <p className="px-1 text-xs font-medium uppercase tracking-wide text-muted">Organization</p>
          <OrganizationSwitcher session={session} />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.href) ? "bg-brand-soft text-brand" : "text-muted hover:bg-subtle hover:text-foreground",
              )}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <Icon d={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line p-4 text-xs text-muted">v0.1.0</div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            className="-ml-1 grid h-10 w-10 place-items-center rounded-lg hover:bg-subtle lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Icon d="M4 6h16M4 12h16M4 18h16" />
          </button>
          <p className="truncate font-semibold lg:hidden">{organizationName(session.organization)}</p>
          {!isProduction && (
            <span className="rounded-md bg-warning-soft px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-warning-fg">
              {env.appEnv}
            </span>
          )}
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline" title={session.user.email}>
              {session.user.name}
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand" aria-hidden>
              {initials(session.user.name)}
            </span>
            <form action={logout}>
              <button type="submit" className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-subtle hover:text-foreground">
                Sign out
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
