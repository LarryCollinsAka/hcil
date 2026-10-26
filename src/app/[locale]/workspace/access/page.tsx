import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq, gt, inArray, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { accessRoles, organizations, profiles, userRoleAssignments } from "@/db/schema";
import { isLocale } from "@/lib/i18n";
import { requireAuthenticatedPrincipal, hasPermission } from "@/modules/identity/application/authorization";
import {
  getActiveRoleKeys,
  getAssignableOrganizationRoleKeys,
  getAssignablePlatformRoleKeys,
  getOrganizationManagementContexts,
  listAssignableRoleDefinitions,
} from "@/modules/identity/application/role-management";
import { assignRoleAction, revokeRoleAction } from "@/modules/identity/auth/access-actions";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

const ERROR_COPY: Record<string, { en: string; fr: string }> = {
  unauthenticated: { en: "Please sign in again.", fr: "Veuillez vous reconnecter." },
  "invalid-input": { en: "Some fields are invalid.", fr: "Certains champs sont invalides." },
  "target-not-found": { en: "That email does not have an HCIL profile yet. The user must register first; invitations are not enabled in this phase.", fr: "Cette adresse ne possède pas encore de profil HCIL. La personne doit d’abord s’inscrire ; les invitations ne sont pas activées à cette étape." },
  "self-change-not-allowed": { en: "You cannot change your own roles here.", fr: "Vous ne pouvez pas modifier vos propres rôles ici." },
  "role-not-found": { en: "That role does not exist.", fr: "Ce rôle n’existe pas." },
  "scope-mismatch": { en: "The role does not match the selected scope or organization type.", fr: "Le rôle ne correspond pas au périmètre ou au type d’organisation sélectionné." },
  forbidden: { en: "You do not have permission for that action.", fr: "Vous n’avez pas l’autorisation d’effectuer cette action." },
  "role-not-assignable": { en: "Your role cannot grant or revoke that role.", fr: "Votre rôle ne permet pas d’attribuer ou de retirer ce rôle." },
  "organization-required": { en: "Choose an organization for an organization-scoped role.", fr: "Choisissez une organisation pour un rôle limité à une organisation." },
  "organization-not-found": { en: "The selected organization could not be found.", fr: "L’organisation sélectionnée est introuvable." },
  "already-assigned": { en: "This user already has that active role in the selected scope.", fr: "Cette personne possède déjà ce rôle actif dans le périmètre sélectionné." },
  "assignment-not-found": { en: "That active role assignment was not found.", fr: "Cette attribution active est introuvable." },
  "role-not-revocable": { en: "Owner and super-admin roles cannot be removed from this screen. Use a controlled ownership-transfer or operator process.", fr: "Les rôles de propriétaire et de super-administrateur ne peuvent pas être retirés depuis cet écran. Utilisez une procédure contrôlée de transfert ou d’administration." },
  "operation-failed": { en: "The operation failed. No success was reported; check the server logs and try again.", fr: "L’opération a échoué. Vérifiez les journaux du serveur puis réessayez." },
};


const ROLE_LABELS_FR: Record<string, string> = {
  super_admin: "Super-administrateur",
  platform_admin: "Administrateur de la plateforme",
  chief_operating_officer: "Directeur des opérations (COO)",
  operations_manager: "Responsable des opérations",
  staff_coordinator: "Coordinateur du personnel",
  support_agent: "Agent d’assistance",
  content_editor: "Éditeur de contenu",
  community_moderator: "Modérateur de communauté",
  finance_manager: "Responsable financier",
  org_owner: "Propriétaire de l’organisation",
  org_admin: "Administrateur de l’organisation",
  org_manager: "Responsable de l’organisation",
  org_staff: "Personnel de l’organisation",
  org_viewer: "Observateur de l’organisation",
  agency_owner: "Propriétaire de l’agence",
  agency_admin: "Administrateur de l’agence",
  agency_manager: "Responsable de l’agence",
  talent_coordinator: "Coordinateur des talents",
  recruiter: "Recruteur",
  agency_finance: "Responsable financier de l’agence",
};

function roleLabel(locale: "en" | "fr", roleKey: string, fallback: string) {
  return locale === "fr" ? ROLE_LABELS_FR[roleKey] ?? fallback : fallback;
}

const SUCCESS_COPY: Record<string, { en: string; fr: string }> = {
  "role-assigned": { en: "Role assigned successfully.", fr: "Rôle attribué avec succès." },
  "role-revoked": { en: "Role revoked successfully.", fr: "Rôle retiré avec succès." },
};

const LABELS = {
  en: {
    eyebrow: "HCIL · ACCESS CONTROL", title: "Manage access", intro: "Assign only the authority a person needs, in the narrowest valid scope. Platform and organization roles are separate.",
    platform: "Platform roles", platformDesc: "For HCIL operations across the platform. Super-admin cannot be granted from this screen.",
    organization: "Organization roles", organizationDesc: "For existing members in an organization you administer. Agency roles remain scoped to the agency.",
    email: "Existing member email", role: "Role", org: "Organization", reason: "Reason / audit note (optional)", assign: "Assign role", revoke: "Revoke", active: "Active assignments", noRoles: "No manageable active assignments found.", noOrg: "You do not currently manage any organization roles.", noPlatform: "You cannot assign platform roles with your current permissions.", note: "This screen manages registered accounts only. It does not send invitations. Agency membership is not consent to represent a talent; representation must be separately approved by the talent.", back: "Back to workspace", scopePlatform: "Platform-wide", scopeOrg: "Organization-scoped", chooseOrg: "Choose organization", openOrg: "Open",
  },
  fr: {
    eyebrow: "HCIL · CONTRÔLE D’ACCÈS", title: "Gérer les accès", intro: "Attribuez uniquement les autorisations nécessaires, dans le périmètre le plus restreint possible. Les rôles de plateforme et d’organisation sont distincts.",
    platform: "Rôles de la plateforme", platformDesc: "Pour les opérations HCIL à l’échelle de la plateforme. Le super-administrateur ne peut pas être attribué depuis cet écran.",
    organization: "Rôles d’organisation", organizationDesc: "Pour les membres existants d’une organisation que vous administrez. Les rôles d’agence restent limités à l’agence.",
    email: "E-mail d’un membre existant", role: "Rôle", org: "Organisation", reason: "Motif / note d’audit (facultatif)", assign: "Attribuer le rôle", revoke: "Retirer", active: "Attributions actives", noRoles: "Aucune attribution active à gérer.", noOrg: "Vous ne gérez actuellement aucun rôle d’organisation.", noPlatform: "Vos permissions ne permettent pas d’attribuer des rôles de plateforme.", note: "Cet écran concerne uniquement les comptes déjà inscrits. Il n’envoie pas d’invitations. L’adhésion à une agence ne vaut pas consentement à représenter un talent ; le talent doit donner son accord séparément.", back: "Retour à l’espace de travail", scopePlatform: "Toute la plateforme", scopeOrg: "Organisation", chooseOrg: "Choisir une organisation", openOrg: "Ouvrir",
  },
} as const;

export default async function WorkspaceAccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ error?: string; success?: string; organization_id?: string; portal?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const fr = locale === "fr";
  const copy = LABELS[locale];
  const query = await searchParams;
  const principal = await requireAuthenticatedPrincipal(locale);
  const [profile] = await db.select({ fullName: profiles.fullName, email: profiles.email }).from(profiles).where(eq(profiles.id, principal.id)).limit(1);
  const portal = query?.portal === "business" || query?.portal === "agency" ? query.portal : "talent";

  const platformActorRoles = await getActiveRoleKeys(principal.id);
  const canAssignPlatform = await hasPermission(principal.id, "platform.roles.assign_non_superadmin");
  const platformAssignableKeys = canAssignPlatform ? getAssignablePlatformRoleKeys(platformActorRoles) : [];
  const platformRoles = await listAssignableRoleDefinitions(platformAssignableKeys);
  const organizationContexts = await getOrganizationManagementContexts(principal.id);
  const selectedOrganizationId = organizationContexts.some((context) => context.organizationId === query?.organization_id)
    ? query?.organization_id
    : organizationContexts[0]?.organizationId;
  const visibleOrganizationContexts = organizationContexts.filter((context) => context.organizationId === selectedOrganizationId);

  if (!canAssignPlatform && organizationContexts.length === 0) {
    redirect(`/${locale}/workspace?error=forbidden`);
  }

  const now = new Date();
  const platformAssignments = platformAssignableKeys.length
    ? await db
        .select({
          id: userRoleAssignments.id,
          targetName: profiles.fullName,
          targetEmail: profiles.email,
          roleKey: accessRoles.roleKey,
          roleLabel: accessRoles.label,
          grantedAt: userRoleAssignments.grantedAt,
        })
        .from(userRoleAssignments)
        .innerJoin(accessRoles, eq(userRoleAssignments.roleId, accessRoles.id))
        .innerJoin(profiles, eq(userRoleAssignments.profileId, profiles.id))
        .where(and(isNull(userRoleAssignments.organizationId), isNull(userRoleAssignments.revokedAt), or(isNull(userRoleAssignments.expiresAt), gt(userRoleAssignments.expiresAt, now)), inArray(accessRoles.roleKey, platformAssignableKeys)))
        .limit(100)
    : [];

  type OrganizationContext = (typeof organizationContexts)[number];
  type RoleDefinition = Awaited<ReturnType<typeof listAssignableRoleDefinitions>>[number];
  type AssignmentView = {
    id: string;
    targetName: string;
    targetEmail: string;
    roleKey: string;
    roleLabel: string;
    grantedAt: Date;
  };
  const organizationSections: Array<{
    context: OrganizationContext;
    assignableKeys: string[];
    roleOptions: RoleDefinition[];
    assignments: AssignmentView[];
  }> = [];
  for (const context of visibleOrganizationContexts) {
    const assignableKeys = getAssignableOrganizationRoleKeys(context.organizationType, context.actorRoleKeys);
    const roleOptions = await listAssignableRoleDefinitions(assignableKeys);
    const assignments = assignableKeys.length
      ? await db
          .select({
            id: userRoleAssignments.id,
            targetName: profiles.fullName,
            targetEmail: profiles.email,
            roleKey: accessRoles.roleKey,
            roleLabel: accessRoles.label,
            grantedAt: userRoleAssignments.grantedAt,
          })
          .from(userRoleAssignments)
          .innerJoin(accessRoles, eq(userRoleAssignments.roleId, accessRoles.id))
          .innerJoin(profiles, eq(userRoleAssignments.profileId, profiles.id))
          .where(and(eq(userRoleAssignments.organizationId, context.organizationId), isNull(userRoleAssignments.revokedAt), or(isNull(userRoleAssignments.expiresAt), gt(userRoleAssignments.expiresAt, now))))
          .limit(100)
      : [];
    organizationSections.push({ context, assignableKeys, roleOptions, assignments });
  }

  return (
    <WorkspaceShell locale={locale} portal={portal} fullName={profile?.fullName ?? ""} email={profile?.email ?? principal.email} canManageAccess={true}>
    <main id="main" className="mx-auto w-full max-w-6xl">
      <Link href={`/${locale}/workspace?portal=${portal}`} className="text-sm font-semibold text-green-800 underline underline-offset-4">← {copy.back}</Link>
      <header className="mt-6 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">{copy.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-green-950 sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 text-sm leading-6 text-green-950/70">{copy.intro}</p>
      </header>

      {query?.error && ERROR_COPY[query.error] ? <p role="alert" className="mt-6 rounded-2xl border border-red-600/20 bg-red-50 px-4 py-3 text-sm text-red-800">{ERROR_COPY[query.error][locale]}</p> : null}
      {query?.success && SUCCESS_COPY[query.success] ? <p role="status" className="mt-6 rounded-2xl border border-green-700/20 bg-green-50 px-4 py-3 text-sm text-green-900">{SUCCESS_COPY[query.success][locale]}</p> : null}

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <article className="rounded-3xl border border-green-950/10 bg-white p-5 sm:p-7">
          <h2 className="text-xl font-extrabold text-green-950">{copy.platform}</h2>
          <p className="mt-2 text-sm leading-6 text-green-950/65">{copy.platformDesc}</p>
          {canAssignPlatform ? (
            <form action={assignRoleAction.bind(null, locale)} className="mt-5 space-y-3">
              <div>
                <label htmlFor="platform_target_email" className="mb-1.5 block text-sm font-semibold text-green-950">{copy.email}</label>
                <input id="platform_target_email" name="target_email" type="email" required maxLength={254} className="w-full rounded-2xl border border-green-950/15 bg-gold-50 px-4 py-3 text-sm text-green-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15" />
              </div>
              <div>
                <label htmlFor="platform_role" className="mb-1.5 block text-sm font-semibold text-green-950">{copy.role}</label>
                <select id="platform_role" name="role_key" required defaultValue="" className="w-full rounded-2xl border border-green-950/15 bg-gold-50 px-4 py-3 text-sm text-green-950">
                  <option value="" disabled>{fr ? "Choisir un rôle" : "Choose a role"}</option>
                  {platformRoles.map((role) => <option key={role.roleKey} value={role.roleKey}>{roleLabel(locale, role.roleKey, role.label)}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="platform_reason" className="mb-1.5 block text-sm font-semibold text-green-950">{copy.reason}</label>
                <input id="platform_reason" name="reason" maxLength={240} className="w-full rounded-2xl border border-green-950/15 bg-gold-50 px-4 py-3 text-sm text-green-950" />
              </div>
              <button type="submit" disabled={platformRoles.length === 0} className="rounded-full bg-green-950 px-5 py-3 text-sm font-bold text-gold-100 hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50">{copy.assign}</button>
            </form>
          ) : <p className="mt-5 text-sm text-green-950/60">{copy.noPlatform}</p>}

          {canAssignPlatform ? <div className="mt-7 border-t border-green-950/10 pt-5">
            <h3 className="font-bold text-green-950">{copy.active} · {copy.scopePlatform}</h3>
            <ul className="mt-3 space-y-2">
              {platformAssignments.map((assignment) => <li key={assignment.id} className="flex flex-col gap-3 rounded-2xl bg-gold-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-sm font-bold text-green-950">{assignment.targetName}</p><p className="text-xs text-green-950/65">{assignment.targetEmail} · {roleLabel(locale, assignment.roleKey, assignment.roleLabel)}</p></div>
                {platformAssignableKeys.includes(assignment.roleKey) ? <form action={revokeRoleAction.bind(null, locale)}><input type="hidden" name="assignment_id" value={assignment.id} /><button type="submit" className="self-start rounded-full border border-red-700/30 px-3 py-1.5 text-xs font-bold text-red-800 hover:bg-red-50">{copy.revoke}</button></form> : null}
              </li>)}
              {platformAssignments.length === 0 ? <li className="text-sm text-green-950/55">{copy.noRoles}</li> : null}
            </ul>
            <p className="mt-2 text-xs text-green-950/45">{fr ? "Affichage limité aux 100 premières attributions accessibles." : "Showing up to the first 100 accessible assignments."}</p>
          </div> : null}
        </article>

        <article className="rounded-3xl border border-green-950/10 bg-white p-5 sm:p-7">
          <h2 className="text-xl font-extrabold text-green-950">{copy.organization}</h2>
          <p className="mt-2 text-sm leading-6 text-green-950/65">{copy.organizationDesc}</p>
          {organizationContexts.length > 1 ? <form method="get" className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1"><label htmlFor="organization-picker" className="mb-1.5 block text-sm font-semibold text-green-950">{copy.chooseOrg}</label>
              <select id="organization-picker" name="organization_id" defaultValue={selectedOrganizationId} className="w-full rounded-2xl border border-green-950/15 bg-gold-50 px-4 py-3 text-sm text-green-950">
                {organizationContexts.map((context) => <option key={context.organizationId} value={context.organizationId}>{context.organizationName}</option>)}
              </select>
            </div>
            <button type="submit" className="rounded-full border border-green-950/15 bg-white px-4 py-3 text-sm font-bold text-green-950 hover:bg-gold-100">{copy.openOrg}</button>
          </form> : null}
          {organizationSections.length === 0 ? <p className="mt-5 text-sm text-green-950/60">{copy.noOrg}</p> : null}
          <div className="mt-5 space-y-6">
            {organizationSections.map(({ context, assignableKeys, roleOptions, assignments }) => <section key={context.organizationId} className="rounded-2xl bg-gold-50 p-4">
              <h3 className="font-extrabold text-green-950">{context.organizationName}</h3>
              <p className="mt-1 text-xs text-green-950/60">{context.organizationType.replaceAll("_", " ")}</p>
              <form action={assignRoleAction.bind(null, locale)} className="mt-4 space-y-3">
                <input type="hidden" name="organization_id" value={context.organizationId} />
                <div><label htmlFor={`email-${context.organizationId}`} className="mb-1.5 block text-sm font-semibold text-green-950">{copy.email}</label><input id={`email-${context.organizationId}`} name="target_email" type="email" required maxLength={254} className="w-full rounded-2xl border border-green-950/15 bg-white px-4 py-3 text-sm text-green-950" /></div>
                <div><label htmlFor={`role-${context.organizationId}`} className="mb-1.5 block text-sm font-semibold text-green-950">{copy.role}</label><select id={`role-${context.organizationId}`} name="role_key" required defaultValue="" className="w-full rounded-2xl border border-green-950/15 bg-white px-4 py-3 text-sm text-green-950"><option value="" disabled>{fr ? "Choisir un rôle" : "Choose a role"}</option>{roleOptions.map((role) => <option key={role.roleKey} value={role.roleKey}>{roleLabel(locale, role.roleKey, role.label)}</option>)}</select></div>
                <div><label htmlFor={`reason-${context.organizationId}`} className="mb-1.5 block text-sm font-semibold text-green-950">{copy.reason}</label><input id={`reason-${context.organizationId}`} name="reason" maxLength={240} className="w-full rounded-2xl border border-green-950/15 bg-white px-4 py-3 text-sm text-green-950" /></div>
                <button type="submit" disabled={roleOptions.length === 0} className="rounded-full bg-green-950 px-4 py-2.5 text-sm font-bold text-gold-100 hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50">{copy.assign}</button>
              </form>
              <div className="mt-5 border-t border-green-950/10 pt-4">
                <h4 className="text-sm font-bold text-green-950">{copy.active}</h4>
                <ul className="mt-2 space-y-2">{assignments.map((assignment) => <li key={assignment.id} className="flex flex-col gap-3 rounded-xl bg-white p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-green-950">{assignment.targetName}</p><p className="text-xs text-green-950/65">{assignment.targetEmail} · {roleLabel(locale, assignment.roleKey, assignment.roleLabel)}</p></div>{assignableKeys.includes(assignment.roleKey) ? <form action={revokeRoleAction.bind(null, locale)}><input type="hidden" name="assignment_id" value={assignment.id} /><input type="hidden" name="organization_id" value={context.organizationId} /><button type="submit" className="self-start rounded-full border border-red-700/30 px-3 py-1.5 text-xs font-bold text-red-800 hover:bg-red-50">{copy.revoke}</button></form> : null}</li>)}{assignments.length === 0 ? <li className="text-sm text-green-950/55">{copy.noRoles}</li> : null}</ul>
                <p className="mt-2 text-xs text-green-950/45">{fr ? "Affichage limité aux 100 premières attributions de cette organisation." : "Showing up to the first 100 assignments for this organization."}</p>
              </div>
            </section>)}
          </div>
        </article>
      </section>

      <aside className="mt-6 rounded-2xl border border-green-950/10 bg-gold-50 p-4 text-sm leading-6 text-green-950/75">{copy.note}</aside>
    </main>
    </WorkspaceShell>
  );
}
