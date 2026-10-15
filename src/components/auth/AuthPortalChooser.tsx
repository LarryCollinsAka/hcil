import Link from "next/link";
import { AUTH_PORTAL_COPY, type AuthPortal } from "@/modules/identity/auth/portals";
import type { Locale } from "@/lib/i18n";

const PORTALS: AuthPortal[] = ["talent", "business", "agency"];

export function AuthPortalChooser({ locale, mode }: { locale: Locale; mode: "sign-in" | "sign-up" }) {
  const fr = locale === "fr";
  const signup = mode === "sign-up";
  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
      <section className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">HCIL · {fr ? "Accès à votre espace" : "Choose your workspace"}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-green-950 sm:text-4xl">{signup ? (fr ? "Comment souhaitez-vous utiliser HCIL ?" : "How will you use HCIL?") : (fr ? "Dans quel espace souhaitez-vous vous connecter ?" : "Which HCIL portal do you want to access?")}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-green-950/70">{fr ? "Les talents, les organisations et les agences ont des parcours distincts. Une identité de connexion unique peut porter plusieurs participations ; les autorisations restent limitées à leur périmètre." : "Talents, organizations, and agencies have different entry journeys. One login identity can support multiple participation types; permissions remain scoped to their proper boundaries."}</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PORTALS.map((portal) => {
            const copy = AUTH_PORTAL_COPY[locale][portal];
            const href = `/${locale}/${portal}/${mode}`;
            return (
              <article key={portal} className="flex h-full flex-col rounded-3xl border border-green-950/10 bg-white p-6 shadow-[0_15px_45px_-35px_rgba(0,22,17,0.32)]">
                <div className="grid size-11 place-items-center rounded-2xl bg-gold-200 text-sm font-black text-green-950" aria-hidden="true">{portal === "talent" ? "T" : portal === "business" ? "B" : "A"}</div>
                <h2 className="mt-4 text-xl font-extrabold text-green-950">{copy.label}</h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-green-950/70">{copy.card}</p>
                <Link href={href} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-green-950 px-4 py-3 text-center text-sm font-bold text-gold-100 transition hover:bg-green-800">{signup ? copy.cta : copy.signInCta}</Link>
              </article>
            );
          })}
        </div>
        <p className="mt-6 text-center text-xs leading-5 text-green-950/60">{fr ? "Sélectionner un espace ne donne aucun droit d’administration ni aucun droit de représenter un talent." : "Choosing a portal does not grant administrative privileges or permission to represent a talent."}</p>
      </section>
    </main>
  );
}
