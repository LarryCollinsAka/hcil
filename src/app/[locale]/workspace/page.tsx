import Link from "next/link";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { isLocale } from "@/lib/i18n";
import { db } from "@/db";
import { accessRoles, organizations, userRoleAssignments, workerProfiles, profiles } from "@/db/schema";
import { hasPermission, requireAuthenticatedPrincipal } from "@/modules/identity/application/authorization";
import { getOrganizationManagementContexts } from "@/modules/identity/application/role-management";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

type Portal = "talent" | "business" | "agency";
function isPortal(value: string | undefined): value is Portal { return value === "talent" || value === "business" || value === "agency"; }

const copy = {
  en: {
    greeting: "Good to see you", overview: "Overview", welcome: "Your HCIL workspace is ready to grow with you.",
    profile: "Profile readiness", profileDesc: "Build a clear picture of your experience and capabilities.",
    capabilities: "Capabilities", capabilitiesDesc: "Organize what you can do and connect it to evidence.",
    evidence: "Evidence passport", evidenceDesc: "Keep claims connected to the proof that supports them.",
    organizations: "Organizations", organizationsDesc: "Organization access is limited to assigned roles and scope.",
    next: "Your next step", noGuarantee: "HCIL is being developed in stages. A profile or recommendation does not guarantee work, employment, or income.",
    getStarted: "Continue setup", manageAccess: "Manage access", forbidden: "You do not have permission to access that resource.",
    welcomeNotice: "Your registration is complete. You can begin setting up your workspace.", passwordUpdated: "Your password has been updated.",
    talentTitle: "Make your capabilities visible", talentNext: "Start with your profile, then add capabilities and evidence so your experience can be understood in context.",
    businessTitle: "Turn work needs into clear outcomes", businessNext: "Set up your organization and define work packages before inviting a team or evaluating candidates.",
    agencyTitle: "Coordinate talent responsibly", agencyNext: "Build your agency workspace and ensure representation is based on explicit talent consent.",
    statRoles: "Active roles", statOrg: "Organization memberships", statProfile: "Talent profile", created: "Created", missing: "Not yet created",
  },
  fr: {
    greeting: "Heureux de vous revoir", overview: "Vue d’ensemble", welcome: "Votre espace HCIL est prêt à évoluer avec vous.",
    profile: "Préparation du profil", profileDesc: "Présentez clairement votre expérience et vos compétences.",
    capabilities: "Compétences", capabilitiesDesc: "Organisez vos capacités et reliez-les à des preuves.",
    evidence: "Passeport de preuves", evidenceDesc: "Reliez chaque affirmation aux preuves qui la soutiennent.",
    organizations: "Organisations", organizationsDesc: "Les accès aux organisations dépendent des rôles et périmètres attribués.",
    next: "Votre prochaine étape", noGuarantee: "HCIL est développé progressivement. Un profil ou une recommandation ne garantit ni mission, ni emploi, ni revenu.",
    getStarted: "Continuer la configuration", manageAccess: "Gérer les accès", forbidden: "Vous n’avez pas l’autorisation d’accéder à cette ressource.",
    welcomeNotice: "Votre inscription est terminée. Vous pouvez commencer à configurer votre espace.", passwordUpdated: "Votre mot de passe a été mis à jour.",
    talentTitle: "Rendez vos compétences visibles", talentNext: "Commencez par votre profil, puis ajoutez vos compétences et preuves pour contextualiser votre expérience.",
    businessTitle: "Transformez les besoins en résultats clairs", businessNext: "Configurez votre organisation et définissez les lots de travail avant d’inviter une équipe ou d’évaluer des candidats.",
    agencyTitle: "Coordonnez les talents de manière responsable", agencyNext: "Configurez votre espace agence et assurez-vous que toute représentation repose sur le consentement explicite du talent.",
    statRoles: "Rôles actifs", statOrg: "Appartenances organisationnelles", statProfile: "Profil talent", created: "Créé", missing: "Pas encore créé",
  },
} as const;

export default async function WorkspacePage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ welcome?: string; error?: string; "password-updated"?: string; portal?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const fr = locale === "fr";
  const t = copy[locale];
  const query = await searchParams;
  const portal: Portal = isPortal(query?.portal) ? query.portal : "talent";
  const principal = await requireAuthenticatedPrincipal(locale);
  const [profile] = await db.select({ fullName: profiles.fullName, email: profiles.email }).from(profiles).where(eq(profiles.id, principal.id)).limit(1);
  const [worker] = await db.select({ profileId: workerProfiles.profileId }).from(workerProfiles).where(eq(workerProfiles.profileId, principal.id)).limit(1);
  const canAssignPlatformRoles = await hasPermission(principal.id, "platform.roles.assign_non_superadmin");
  const organizationManagementContexts = await getOrganizationManagementContexts(principal.id);
  const canManageAccess = canAssignPlatformRoles || organizationManagementContexts.length > 0;
  const now = new Date();
  const roles = await db.select({ roleKey: accessRoles.roleKey, roleLabel: accessRoles.label, scope: accessRoles.scope, organizationId: userRoleAssignments.organizationId, organizationName: organizations.name })
    .from(userRoleAssignments).innerJoin(accessRoles, eq(userRoleAssignments.roleId, accessRoles.id)).leftJoin(organizations, eq(userRoleAssignments.organizationId, organizations.id))
    .where(and(eq(userRoleAssignments.profileId, principal.id), isNull(userRoleAssignments.revokedAt), or(isNull(userRoleAssignments.expiresAt), gt(userRoleAssignments.expiresAt, now))));
  const organizationRoles = roles.filter((role) => role.scope === "organization");
  const title = portal === "talent" ? t.talentTitle : portal === "business" ? t.businessTitle : t.agencyTitle;
  const description = portal === "talent" ? t.talentNext : portal === "business" ? t.businessNext : t.agencyNext;
  const cards = portal === "talent" ? [
    { icon: "◉", title: t.profile, value: worker ? t.created : t.missing, desc: t.profileDesc, href: `/${locale}/workspace/profile` },
    { icon: "✦", title: t.capabilities, value: "—", desc: t.capabilitiesDesc, href: `/${locale}/workspace/capabilities` },
    { icon: "▤", title: t.evidence, value: "—", desc: t.evidenceDesc, href: `/${locale}/workspace/evidence` },
  ] : portal === "business" ? [
    { icon: "▦", title: t.organizations, value: String(organizationRoles.length), desc: t.organizationsDesc, href: `/${locale}/workspace/organization?portal=business` },
    { icon: "▤", title: fr ? "Lots de travail" : "Work packages", value: "—", desc: fr ? "Définissez les résultats, étapes et preuves attendues." : "Define outcomes, milestones, and expected evidence.", href: `/${locale}/workspace/work?portal=business` },
    { icon: "♧", title: fr ? "Équipe" : "Team", value: String(organizationRoles.length), desc: fr ? "Consultez les rôles organisationnels qui vous sont attribués." : "Review the organization roles assigned to you.", href: `/${locale}/workspace/team?portal=business` },
  ] : [
    { icon: "◉", title: fr ? "Répertoire de talents" : "Talent roster", value: "—", desc: fr ? "Organisez les profils avec les autorisations appropriées." : "Organize talent profiles with appropriate permissions.", href: `/${locale}/workspace/candidates?portal=agency` },
    { icon: "✓", title: fr ? "Consentements" : "Consents", value: "—", desc: fr ? "Vérifiez le consentement avant toute représentation." : "Confirm consent before representing a person.", href: `/${locale}/workspace/consents?portal=agency` },
    { icon: "↗", title: fr ? "Placements" : "Placements", value: "—", desc: fr ? "Suivez les étapes de placement lorsqu’elles seront activées." : "Track placement workflows as they become available.", href: `/${locale}/workspace/placements?portal=agency` },
  ];

  return <WorkspaceShell locale={locale} portal={portal} fullName={profile?.fullName ?? ""} email={profile?.email ?? principal.email} canManageAccess={canManageAccess}>
    <main id="main" className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">HCIL · {t.overview}</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{t.greeting}{profile?.fullName ? `, ${profile.fullName.split(" ")[0]}` : ""}</h1><p className="mt-2 text-sm text-green-950/60">{t.welcome}</p></div>
        {canManageAccess ? <Link href={`/${locale}/workspace/access?portal=${portal}`} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-green-950/15 bg-white px-4 py-2 text-sm font-bold hover:bg-gold-50">{t.manageAccess} →</Link> : null}
      </div>
      {query?.welcome === "1" ? <p role="status" className="mt-5 rounded-xl border border-green-700/20 bg-green-50 px-4 py-3 text-sm text-green-900">{t.welcomeNotice}</p> : null}
      {query?.["password-updated"] === "1" ? <p role="status" className="mt-5 rounded-xl border border-green-700/20 bg-green-50 px-4 py-3 text-sm text-green-900">{t.passwordUpdated}</p> : null}
      {query?.error === "forbidden" ? <p role="alert" className="mt-5 rounded-xl border border-red-600/20 bg-red-50 px-4 py-3 text-sm text-red-800">{t.forbidden}</p> : null}

      <section aria-label={fr ? "Indicateurs" : "Metrics"} className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-green-950/10 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-green-950/65">{t.statRoles}</p><span className="grid size-10 place-items-center rounded-xl bg-gold-100 text-lg">♙</span></div><p className="mt-4 text-3xl font-black">{roles.length}</p><p className="mt-1 text-xs text-green-950/50">{fr ? "Autorisations actuellement attribuées" : "Currently assigned role records"}</p></article>
        <article className="rounded-2xl border border-green-950/10 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-green-950/65">{t.statOrg}</p><span className="grid size-10 place-items-center rounded-xl bg-green-50 text-lg">▦</span></div><p className="mt-4 text-3xl font-black">{new Set(organizationRoles.map((role) => role.organizationId).filter(Boolean)).size}</p><p className="mt-1 text-xs text-green-950/50">{fr ? "Périmètre organisationnel" : "Organization-scoped access"}</p></article>
        <article className="rounded-2xl border border-green-950/10 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-green-950/65">{portal === "talent" ? t.statProfile : (fr ? "Espace sélectionné" : "Selected workspace")}</p><span className="grid size-10 place-items-center rounded-xl bg-gold-100 text-lg">✦</span></div><p className="mt-4 text-xl font-black">{portal === "talent" ? (worker ? t.created : t.missing) : portal === "business" ? (fr ? "Entreprise" : "Employer") : (fr ? "Agence" : "Agency")}</p><p className="mt-1 text-xs text-green-950/50">{fr ? "Le portail ne confère pas de permissions supplémentaires" : "Portal choice does not grant additional permissions"}</p></article>
      </section>

      <section className="mt-8"><div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-xl font-extrabold">{title}</h2><p className="mt-1 text-sm text-green-950/60">{description}</p></div><span className="hidden rounded-full border border-green-950/10 bg-white px-3 py-1.5 text-xs font-semibold text-green-950/60 md:inline-flex">{fr ? "Aperçu du pilote" : "Pilot preview"}</span></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{cards.map((card) => <Link key={card.title} href={card.href} className="group rounded-2xl border border-green-950/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-700/30 hover:shadow-md"><div className="flex items-start justify-between gap-3"><span className="grid size-11 place-items-center rounded-xl bg-gold-100 text-xl text-green-950">{card.icon}</span><span className="text-green-700 transition group-hover:translate-x-1" aria-hidden="true">→</span></div><h3 className="mt-4 text-base font-extrabold">{card.title}</h3><p className="mt-2 text-sm leading-6 text-green-950/60">{card.desc}</p><p className="mt-4 text-sm font-bold text-green-800">{card.value}</p></Link>)}</div>
      </section>

      <section className="mt-8 rounded-2xl border border-green-950/10 bg-white p-6 sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">{t.next}</p><h2 className="mt-3 text-2xl font-black">{title}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-green-950/65">{description} {t.noGuarantee}</p><Link href={`/${locale}/workspace/profile?portal=${portal}`} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-green-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800">{t.getStarted} <span className="ml-2" aria-hidden="true">→</span></Link></section>
    </main>
  </WorkspaceShell>;
}
