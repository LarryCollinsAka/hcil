import Link from "next/link";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { isLocale } from "@/lib/i18n";
import { db } from "@/db";
import { accessRoles, organizations, userRoleAssignments, workerProfiles, profiles } from "@/db/schema";
import { hasPermission, requireAuthenticatedPrincipal } from "@/modules/identity/application/authorization";
import { getOrganizationManagementContexts } from "@/modules/identity/application/role-management";
import { signOutAction } from "@/modules/identity/auth/actions";

export default async function WorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ welcome?: string; error?: string; "password-updated"?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const fr = locale === "fr";
  const query = await searchParams;
  const principal = await requireAuthenticatedPrincipal(locale);
  const [profile] = await db.select({ fullName: profiles.fullName, email: profiles.email }).from(profiles).where(eq(profiles.id, principal.id)).limit(1);
  const [worker] = await db.select({ profileId: workerProfiles.profileId }).from(workerProfiles).where(eq(workerProfiles.profileId, principal.id)).limit(1);
  const canAssignPlatformRoles = await hasPermission(principal.id, "platform.roles.assign_non_superadmin");
  const organizationManagementContexts = await getOrganizationManagementContexts(principal.id);
  const canManageAccess = canAssignPlatformRoles || organizationManagementContexts.length > 0;
  const now = new Date();
  const roles = await db
    .select({ roleKey: accessRoles.roleKey, roleLabel: accessRoles.label, scope: accessRoles.scope, organizationId: userRoleAssignments.organizationId, organizationName: organizations.name })
    .from(userRoleAssignments)
    .innerJoin(accessRoles, eq(userRoleAssignments.roleId, accessRoles.id))
    .leftJoin(organizations, eq(userRoleAssignments.organizationId, organizations.id))
    .where(and(eq(userRoleAssignments.profileId, principal.id), isNull(userRoleAssignments.revokedAt), or(isNull(userRoleAssignments.expiresAt), gt(userRoleAssignments.expiresAt, now))));

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-16">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">HCIL · {fr ? "Espace de travail" : "Workspace"}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-green-950 sm:text-4xl">{fr ? `Bonjour ${profile?.fullName ?? ""}` : `Welcome ${profile?.fullName ?? ""}`}</h1>
          <p className="mt-2 text-sm text-green-950/65">{profile?.email ?? principal.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManageAccess ? <Link href={`/${locale}/workspace/access`} className="rounded-full border border-green-950/15 bg-white px-4 py-2.5 text-sm font-semibold text-green-950 hover:bg-gold-100">{fr ? "Gérer les accès" : "Manage access"}</Link> : null}
          <form action={signOutAction.bind(null, locale)}>
            <button type="submit" className="rounded-full border border-green-950/15 bg-white px-4 py-2.5 text-sm font-semibold text-green-950 hover:bg-gold-100">{fr ? "Se déconnecter" : "Sign out"}</button>
          </form>
        </div>
      </div>

      {query?.welcome === "1" ? <p role="status" className="mt-6 rounded-2xl border border-green-700/20 bg-green-50 px-4 py-3 text-sm text-green-900">{fr ? "Votre inscription est terminée. Vous pouvez commencer à configurer votre espace." : "Your registration is complete. You can begin setting up your workspace."}</p> : null}
      {query?.["password-updated"] === "1" ? <p role="status" className="mt-6 rounded-2xl border border-green-700/20 bg-green-50 px-4 py-3 text-sm text-green-900">{fr ? "Votre mot de passe a été mis à jour." : "Your password has been updated."}</p> : null}
      {query?.error === "forbidden" ? <p role="alert" className="mt-6 rounded-2xl border border-red-600/20 bg-red-50 px-4 py-3 text-sm text-red-800">{fr ? "Vous n’avez pas l’autorisation d’accéder à cette ressource." : "You do not have permission to access that resource."}</p> : null}

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-green-950/10 bg-white p-6">
          <div className="grid size-11 place-items-center rounded-2xl bg-gold-200 text-lg" aria-hidden="true">✦</div>
          <h2 className="mt-4 text-xl font-extrabold text-green-950">{fr ? "Votre parcours talent" : "Your talent pathway"}</h2>
          <p className="mt-2 text-sm leading-6 text-green-950/70">{fr ? "Les compétences, les preuves et les missions seront organisées dans cet espace. Une preuve de compétence restera liée à ce qu’elle démontre réellement." : "Capabilities, evidence, and assignments will live here. Each capability record will remain tied to what its evidence actually demonstrates."}</p>
          {worker ? <p className="mt-4 inline-flex rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800">{fr ? "Profil talent créé" : "Talent profile created"}</p> : <p className="mt-4 text-xs text-green-950/50">{fr ? "Aucun profil talent associé à ce compte." : "No talent profile is associated with this account."}</p>}
        </article>
        <article className="rounded-3xl border border-green-950/10 bg-white p-6">
          <div className="grid size-11 place-items-center rounded-2xl bg-gold-200 text-lg" aria-hidden="true">▦</div>
          <h2 className="mt-4 text-xl font-extrabold text-green-950">{fr ? "Vos organisations" : "Your organizations"}</h2>
          <p className="mt-2 text-sm leading-6 text-green-950/70">{fr ? "Les rôles organisationnels sont limités à leur organisation. Être membre d’une agence ne donne pas automatiquement le droit de représenter un talent." : "Organization roles are scoped to their organization. Agency membership does not automatically grant authority to represent a talent."}</p>
          {roles.filter((role) => role.scope === "organization").length ? (
            <ul className="mt-4 space-y-2">
              {roles.filter((role) => role.scope === "organization").map((role) => (
                <li key={`${role.roleKey}-${role.organizationId}`} className="rounded-2xl bg-gold-50 px-4 py-3">
                  <p className="text-sm font-bold text-green-950">{role.organizationName ?? (fr ? "Organisation" : "Organization")}</p>
                  <p className="mt-0.5 text-xs text-green-950/65">{role.roleLabel}</p>
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 text-xs text-green-950/50">{fr ? "Aucune organisation liée à ce compte." : "No organization is linked to this account."}</p>}
        </article>
      </section>

      <section className="mt-6 rounded-3xl bg-green-950 p-6 text-gold-100 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-400">{fr ? "Prochaine étape" : "Next step"}</p>
        <h2 className="mt-3 text-2xl font-black">{fr ? "L’authentification est en place ; les espaces métier arrivent progressivement." : "Authentication is in place; business workflows will be added in stages."}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gold-100/75">{fr ? "HCIL est encore en développement. L’accès à cet espace ne signifie pas qu’un volume de missions ou un revenu est garanti. Les droits sensibles sont attribués explicitement et les représentations par une agence nécessitent le consentement du talent." : "HCIL is still in development. Access to this workspace does not mean tasks or income are guaranteed. Sensitive permissions are assigned explicitly, and agency representation requires talent consent."}</p>
        <Link href={`/${locale}/about/intelligence`} className="mt-5 inline-flex rounded-full bg-gold-500 px-5 py-3 text-sm font-bold text-green-950 hover:bg-gold-400">{fr ? "Comprendre HCIL" : "Learn about HCIL"}</Link>
      </section>
    </main>
  );
}
