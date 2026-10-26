"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { LocaleSwitcher } from "@/components/site/LocaleSwitcher";
import { signOutAction } from "@/modules/identity/auth/actions";

type Portal = "talent" | "business" | "agency";
type Item = { key: string; href: string; icon: string; en: string; fr: string };
const menus: Record<Portal, Item[]> = {
  talent: [
    { key: "overview", href: "/workspace", icon: "◫", en: "Overview", fr: "Vue d’ensemble" },
    { key: "profile", href: "/workspace/profile", icon: "◉", en: "My profile", fr: "Mon profil" },
    { key: "capabilities", href: "/workspace/capabilities", icon: "✦", en: "Capabilities", fr: "Compétences" },
    { key: "evidence", href: "/workspace/evidence", icon: "▤", en: "Evidence passport", fr: "Passeport de preuves" },
    { key: "opportunities", href: "/workspace/opportunities", icon: "↗", en: "Opportunities", fr: "Opportunités" },
    { key: "learning", href: "/workspace/learning", icon: "▣", en: "Learning pathways", fr: "Parcours d’apprentissage" },
    { key: "settings", href: "/workspace/settings", icon: "⚙", en: "Settings", fr: "Paramètres" },
  ],
  business: [
    { key: "overview", href: "/workspace", icon: "◫", en: "Overview", fr: "Vue d’ensemble" },
    { key: "organization", href: "/workspace/organization", icon: "▦", en: "Organization", fr: "Organisation" },
    { key: "work", href: "/workspace/work", icon: "▤", en: "Work packages", fr: "Lots de travail" },
    { key: "talent", href: "/workspace/talent-search", icon: "◉", en: "Talent search", fr: "Recherche de talents" },
    { key: "team", href: "/workspace/team", icon: "♧", en: "Team & access", fr: "Équipe et accès" },
    { key: "reports", href: "/workspace/reports", icon: "▥", en: "Reports", fr: "Rapports" },
    { key: "settings", href: "/workspace/settings", icon: "⚙", en: "Settings", fr: "Paramètres" },
  ],
  agency: [
    { key: "overview", href: "/workspace", icon: "◫", en: "Overview", fr: "Vue d’ensemble" },
    { key: "candidates", href: "/workspace/candidates", icon: "◉", en: "Talent roster", fr: "Répertoire de talents" },
    { key: "consents", href: "/workspace/consents", icon: "✓", en: "Representation consent", fr: "Consentements de représentation" },
    { key: "placements", href: "/workspace/placements", icon: "↗", en: "Placements", fr: "Placements" },
    { key: "clients", href: "/workspace/clients", icon: "▦", en: "Client organizations", fr: "Organisations clientes" },
    { key: "team", href: "/workspace/team", icon: "♧", en: "Team & access", fr: "Équipe et accès" },
    { key: "settings", href: "/workspace/settings", icon: "⚙", en: "Settings", fr: "Paramètres" },
  ],
};
const portalLabels = {
  talent: { en: "Talent Studio", fr: "Studio Talent", taglineEn: "Your capabilities, made visible.", taglineFr: "Rendez vos compétences visibles." },
  business: { en: "Employer Workspace", fr: "Espace Employeur", taglineEn: "Define work. Coordinate outcomes.", taglineFr: "Définissez le travail. Coordonnez les résultats." },
  agency: { en: "Agency Studio", fr: "Studio Agence", taglineEn: "Manage representation with consent.", taglineFr: "Gérez la représentation avec consentement." },
};

export function WorkspaceShell({
  locale, portal, fullName, email, canManageAccess = false, children,
}: {
  locale: Locale; portal: Portal; fullName: string; email: string; canManageAccess?: boolean; children: React.ReactNode;
}) {
  const fr = locale === "fr";
  const pathname = usePathname() ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const base = `/${locale}`;
  const copy = portalLabels[portal];
  const items = [...menus[portal], ...(canManageAccess ? [{ key: "access", href: "/workspace/access", icon: "⚿", en: "Access administration", fr: "Administration des accès" }] : [])];
  const portalHref = (path: string) => `${base}${path}${path === "/workspace" ? `?portal=${portal}` : `?portal=${portal}`}`;
  const sidebar = <>
    <div className="border-b border-white/10 px-5 py-5">
      <Link href={`${base}`} className="inline-flex items-center gap-2 font-black tracking-tight text-white"><span className="grid size-9 place-items-center rounded-xl bg-gold-500 text-sm text-green-950">H</span><span>HCIL<span className="ml-1 font-medium text-white/60">/ {fr ? "Espace" : "Workspace"}</span></span></Link>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-gold-400">{fr ? copy.fr : copy.en}</p>
      <p className="mt-1 text-xs leading-5 text-white/60">{fr ? copy.taglineFr : copy.taglineEn}</p>
    </div>
    <nav aria-label={fr ? "Navigation de l’espace" : "Workspace navigation"} className="flex-1 space-y-1 px-3 py-4">
      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">{fr ? "Espace de travail" : "Workspace"}</p>
      {items.map((item) => {
        const active = item.key === "overview" ? pathname.endsWith("/workspace") : pathname.endsWith(item.href);
        return <Link key={item.key} href={portalHref(item.href.replace(base, ""))} onClick={() => setMobileOpen(false)} aria-current={active ? "page" : undefined}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-gold-500 text-green-950 shadow-sm" : "text-white/75 hover:bg-white/10 hover:text-white"}`}>
          <span className="grid size-6 place-items-center text-base" aria-hidden="true">{item.icon}</span>{fr ? item.fr : item.en}
        </Link>;
      })}
    </nav>
    <div className="border-t border-white/10 p-4">
      <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gold-200 text-sm font-black text-green-950">{(fullName || email || "H").slice(0, 1).toUpperCase()}</div>
        <div className="min-w-0"><p className="truncate text-sm font-bold text-white">{fullName || (fr ? "Membre HCIL" : "HCIL member")}</p><p className="truncate text-xs text-white/50">{email}</p></div>
      </div>
      <form action={signOutAction.bind(null, locale)} className="mt-3">
        <button type="submit" className="w-full rounded-xl border border-white/15 px-3 py-2.5 text-left text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white">↪ {fr ? "Se déconnecter" : "Sign out"}</button>
      </form>
    </div>
  </>;

  return <div className="min-h-screen bg-[#f7f8f5] text-green-950 lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
    <aside className="hidden min-h-screen flex-col bg-green-950 lg:sticky lg:top-0 lg:flex lg:h-screen">{sidebar}</aside>
    {mobileOpen ? <div className="fixed inset-0 z-[70] lg:hidden"><button aria-label={fr ? "Fermer le menu" : "Close menu"} className="absolute inset-0 bg-green-950/50" onClick={() => setMobileOpen(false)} /><aside className="relative flex h-full w-[min(86vw,300px)] flex-col bg-green-950">{sidebar}</aside></div> : null}
    <div className="min-w-0">
      <header className="sticky top-0 z-40 flex min-h-[76px] items-center justify-between gap-3 border-b border-green-950/10 bg-white/95 px-4 backdrop-blur sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" aria-label={fr ? "Ouvrir le menu" : "Open menu"} onClick={() => setMobileOpen(true)} className="grid size-10 shrink-0 place-items-center rounded-xl border border-green-950/10 text-lg lg:hidden">☰</button>
          <div className="min-w-0"><p className="text-xs font-semibold text-green-700">HCIL / {fr ? copy.fr : copy.en}</p><p className="truncate text-sm font-bold text-green-950">{fr ? "Espace de travail sécurisé" : "Secure workspace"}</p></div>
        </div>
        <div className="flex items-center gap-3"><span className="hidden text-sm text-green-950/60 sm:inline">{fr ? "Langue" : "Language"}</span><LocaleSwitcher locale={locale} label={fr ? "Langue" : "Language"} /><Link href={`${base}/about`} className="hidden rounded-full border border-green-950/10 px-3 py-2 text-xs font-semibold hover:bg-gold-50 sm:inline-flex">{fr ? "À propos de HCIL" : "About HCIL"}</Link></div>
      </header>
      <div className="min-h-[calc(100vh-150px)] px-4 py-6 sm:px-7 sm:py-8">{children}</div>
      <footer className="flex flex-col justify-between gap-2 border-t border-green-950/10 bg-white px-4 py-4 text-xs text-green-950/55 sm:flex-row sm:px-7"><span>© {new Date().getFullYear()} HCIL · {fr ? "Espace de travail" : "Workspace"}</span><span>{fr ? "Des capacités vérifiables. Des opportunités plus claires." : "Verifiable capabilities. Clearer opportunities."}</span></footer>
    </div>
  </div>;
}
