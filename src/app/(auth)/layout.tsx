import { env } from "@/lib/env";

/** Sign-in and sign-up: a centred card without the app shell. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-sm font-bold text-brand-fg">A</span>
          <span className="text-xl font-semibold">{env.appName}</span>
        </div>
        {children}
      </div>
    </main>
  );
}
