import type { Metadata } from "next";
import { Badge } from "@/components/Badge";
import {
  AddMemberForm,
  CreateOrganizationForm,
  OrganizationDetailsForm,
  RemoveMemberButton,
} from "@/components/OrganizationForms";
import { getMembers, getOrganization, getSession } from "@/lib/data";
import { organizationName, organizationStatusTone, toneStyles } from "@/lib/utils";

export const metadata: Metadata = { title: "Organization" };

export default async function OrganizationPage() {
  const [session, organization, members] = await Promise.all([getSession(), getOrganization(), getMembers()]);
  const name = organizationName(organization);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold sm:text-3xl">{name}</h1>
          <Badge className={toneStyles[organizationStatusTone[organization.status]]}>{organization.status}</Badge>
          {!organization.isActive && <Badge className={toneStyles.danger}>Inactive</Badge>}
        </div>
        {name !== organization.legalName && <p className="mt-1 text-sm text-muted">{organization.legalName}</p>}
        <p className="mt-1 text-sm text-muted">
          {members.length} {members.length === 1 ? "member" : "members"}. Every member can see and edit all of this
          organization&apos;s audits and findings.
        </p>
      </div>

      <section className="card space-y-4 p-4 sm:p-6">
        <div>
          <h2 className="font-semibold">Organization details</h2>
          <p className="mt-1 text-sm text-muted">Only the legal name is required. The status is managed outside the app.</p>
        </div>
        <OrganizationDetailsForm organization={organization} />
      </section>

      <section className="card space-y-4 p-4 sm:p-6">
        <h2 className="font-semibold">Members</h2>
        <ul className="divide-y divide-line">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {m.name}
                  {m.id === session.user.id && <span className="ml-2 text-xs font-normal text-muted">(you)</span>}
                </p>
                <p className="truncate text-xs text-muted">{m.email}</p>
              </div>
              <RemoveMemberButton userId={m.id} name={m.name} isSelf={m.id === session.user.id} />
            </li>
          ))}
        </ul>
      </section>

      <section className="card space-y-4 p-4 sm:p-6">
        <h2 className="font-semibold">Add a member</h2>
        <AddMemberForm />
      </section>

      <section className="card space-y-4 p-4 sm:p-6">
        <div>
          <h2 className="font-semibold">New organization</h2>
          <p className="mt-1 text-sm text-muted">Start a separate workspace. Its data is never shared with this one.</p>
        </div>
        <CreateOrganizationForm />
      </section>
    </div>
  );
}
