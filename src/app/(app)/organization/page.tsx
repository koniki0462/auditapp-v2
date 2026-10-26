import type { Metadata } from "next";
import { Badge } from "@/components/Badge";
import {
  AddMemberForm,
  CreateMemberForm,
  CreateOrganizationForm,
  MemberRoleSelect,
  OrganizationDetailsForm,
  RemoveMemberButton,
} from "@/components/OrganizationForms";
import { getMembers, getOrganization, getSession, type Organization } from "@/lib/data";
import { canManageOrganization, organizationName, organizationStatusTone, toneStyles } from "@/lib/utils";

export const metadata: Metadata = { title: "Organization" };

/** What a member who can't edit the organization sees instead of the form. */
function OrganizationDetails({ organization: o }: { organization: Organization }) {
  const rows: Array<[string, string | null]> = [
    ["Legal name", o.legalName],
    ["Trade name", o.tradeName],
    ["Entity type", o.entityType],
    ["Contact email", o.contactEmail],
    ["Contact number", o.contactNumber],
    ["Address", o.address],
  ];
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs text-muted">{label}</dt>
          <dd className="mt-0.5 text-sm">{value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function OrganizationPage() {
  const [session, organization, members] = await Promise.all([getSession(), getOrganization(), getMembers()]);
  const name = organizationName(organization);
  const isAdmin = canManageOrganization(session);

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
          organization&apos;s audits and findings; organization admins also manage its details and members.
        </p>
      </div>

      <section className="card space-y-4 p-4 sm:p-6">
        <div>
          <h2 className="font-semibold">Organization details</h2>
          <p className="mt-1 text-sm text-muted">
            {isAdmin
              ? "Only the legal name is required. The status is managed outside the app."
              : "Only organization admins can change these details."}
          </p>
        </div>
        {isAdmin ? <OrganizationDetailsForm organization={organization} /> : <OrganizationDetails organization={organization} />}
      </section>

      <section className="card space-y-4 p-4 sm:p-6">
        <h2 className="font-semibold">Members</h2>
        <ul className="divide-y divide-line">
          {members.map((m) => {
            const isSelf = m.id === session.user.id;
            return (
              <li key={m.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {m.name}
                    {isSelf && <span className="ml-2 text-xs font-normal text-muted">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {[m.email, m.phoneNumber].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  {isAdmin ? (
                    <MemberRoleSelect userId={m.id} name={m.name} role={m.role} />
                  ) : (
                    <Badge className={toneStyles[m.role === "Organization Admin" ? "info" : "neutral"]}>{m.role}</Badge>
                  )}
                  {(isAdmin || isSelf) && <RemoveMemberButton userId={m.id} name={m.name} isSelf={isSelf} />}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {isAdmin && (
        <>
          <section className="card space-y-4 p-4 sm:p-6">
            <div>
              <h2 className="font-semibold">Create a member</h2>
              <p className="mt-1 text-sm text-muted">
                Creates their account. Choose an initial password and give it to them.
              </p>
            </div>
            <CreateMemberForm />
          </section>

          <section className="card space-y-4 p-4 sm:p-6">
            <h2 className="font-semibold">Add an existing account</h2>
            <AddMemberForm />
          </section>
        </>
      )}

      {session.user.isApplicationAdmin && (
        <section className="card space-y-4 p-4 sm:p-6">
          <div>
            <h2 className="font-semibold">New organization</h2>
            <p className="mt-1 text-sm text-muted">
              Application admins only. You become its first organization admin and can then create its members and
              admins. Its data is never shared with this one.
            </p>
          </div>
          <CreateOrganizationForm />
        </section>
      )}
    </div>
  );
}
