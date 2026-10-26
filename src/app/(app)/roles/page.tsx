import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { CreateRoleForm, DeleteRoleButton } from "@/components/RoleForms";
import { getRoles, getSession } from "@/lib/data";
import { toneStyles } from "@/lib/utils";

export const metadata: Metadata = { title: "Roles" };

/** The global role catalogue. Application admins only; for everyone else the page doesn't exist. */
export default async function RolesPage() {
  const session = await getSession();
  if (!session.user.isApplicationAdmin) notFound();
  const roles = await getRoles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Roles</h1>
        <p className="mt-1 text-sm text-muted">
          The role catalogue, shared by every organization. Who can manage an organization is set per member on the
          Organization page.
        </p>
      </div>

      <section className="card space-y-4 p-4 sm:p-6">
        <h2 className="font-semibold">New role</h2>
        <CreateRoleForm />
      </section>

      <section className="card p-4 sm:p-6">
        <ul className="divide-y divide-line">
          {roles.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {r.name}
                  {!r.isActive && <Badge className={toneStyles.neutral}>Inactive</Badge>}
                </p>
                {r.description && <p className="text-xs text-muted">{r.description}</p>}
              </div>
              <DeleteRoleButton id={r.id} name={r.name} />
            </li>
          ))}
        </ul>
        {roles.length === 0 && <p className="text-sm text-muted">No roles yet.</p>}
      </section>
    </div>
  );
}
