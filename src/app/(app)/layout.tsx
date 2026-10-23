import { AppShell } from "@/components/AppShell";
import { getSession } from "@/lib/data";

/** Pages that need a signed-in user. Loads the session once for the sidebar, header and organization switcher. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return <AppShell session={session}>{children}</AppShell>;
}
