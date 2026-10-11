import Link from "next/link";
import type { AboutPageData, AboutSlug } from "@/content/about";
import { getAboutNav } from "@/content/about";
import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/i18n";
import { AboutSubnav } from "./AboutSubnav";
import { container } from "@/components/site/ui";

export function AboutPageView({ locale, page, active }: { locale: Locale; page: AboutPageData; active: AboutSlug }) {
  const nav = getAboutNav(locale).filter((item) => item.slug !== "overview");
  const isOverview = active === "overview";
  return (
    <main id="main" className="pb-20">
      <section className="border-b border-green-950/10 bg-gold-100 py-16 sm:py-24">
        <div className={container}>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">{page.eyebrow}</p>
          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl">{page.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-green-900/85 sm:text-xl">{page.intro}</p>
          <AboutSubnav locale={locale} active={active} />
          {isOverview && (
            <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {nav.map((item, i) => (
                <Link key={item.slug} href={href(locale, item.path)} className="group rounded-3xl border border-green-950/10 bg-gold-50 p-5 transition hover:-translate-y-1 hover:shadow-lg">
                  <span className="grid size-9 place-items-center rounded-full bg-gold-500 text-sm font-bold text-green-950">0{i + 1}</span>
                  <h2 className="mt-5 text-lg font-semibold tracking-tight">{item.label}</h2>
                  <p className="mt-2 text-sm text-green-900/70">{locale === "fr" ? "Explorer ce volet de l’approche HCIL." : "Explore this part of the HCIL approach."}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-800">{locale === "fr" ? "En savoir plus" : "Learn more"} <span aria-hidden="true">↗</span></span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className={`${container} pt-12 sm:pt-16`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-10">
            {page.sections.map((section) => (
              <section key={section.heading} className="max-w-3xl">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{section.heading}</h2>
                {section.paragraphs.map((paragraph, index) => <p key={index} className="mt-4 text-base leading-8 text-green-900/85">{paragraph}</p>)}
                {section.bullets && <ul className="mt-4 space-y-3">{section.bullets.map((bullet) => <li key={bullet} className="flex gap-3 text-base leading-relaxed text-green-900/85"><span className="mt-2 size-2 shrink-0 rounded-full bg-red-600"/><span>{bullet}</span></li>)}</ul>}
              </section>
            ))}
            {page.principles && <div className="grid gap-3 sm:grid-cols-3">{page.principles.map((item) => <article key={item.title} className="rounded-3xl border border-green-950/10 bg-gold-100 p-5"><h3 className="font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-green-900/80">{item.text}</p></article>)}</div>}
            {page.sources && <section className="border-t border-green-950/10 pt-8"><h2 className="text-2xl font-semibold tracking-tight">{locale === "fr" ? "Sources officielles et lectures" : "Official sources and further reading"}</h2><p className="mt-3 max-w-3xl text-sm leading-relaxed text-green-900/75">{locale === "fr" ? "Les sources décrivent les cadres cités ; leur présence ici ne signifie pas que HCIL est approuvé par leurs éditeurs." : "These sources describe the cited frameworks; linking to them does not mean HCIL is endorsed by the publishing institutions."}</p><div className="mt-5 grid gap-3">{page.sources.map((source) => <article key={source.url} className="rounded-2xl border border-green-950/10 bg-white/60 p-5"><a href={source.url} target="_blank" rel="noreferrer" className="font-semibold text-green-800 underline decoration-gold-600 decoration-2 underline-offset-4 hover:text-green-950">{source.name} ↗</a><p className="mt-1 text-xs font-semibold uppercase tracking-wider text-green-700">{source.publisher}</p><p className="mt-3 text-sm leading-relaxed text-green-900/80">{source.relevance}</p>{source.statusNote && <p className="mt-2 text-xs leading-relaxed text-green-900/60">{source.statusNote}</p>}</article>)}</div></section>}
            {page.notice && <aside className="rounded-2xl border border-green-950/15 bg-gold-100 p-5 text-sm leading-relaxed text-green-900"><strong>{locale === "fr" ? "À noter : " : "Important: "}</strong>{page.notice}</aside>}
          </div>
          <aside className="h-fit rounded-3xl bg-green-950 p-6 text-gold-50 lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-400">{locale === "fr" ? "Explorer HCIL" : "Explore HCIL"}</p>
            <div className="mt-4 space-y-1">{nav.map((item) => <Link key={item.slug} href={href(locale, item.path)} className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm text-gold-50/85 transition hover:bg-green-900 hover:text-gold-50"><span>{item.label}</span><span aria-hidden="true">↗</span></Link>)}</div>
            <div className="mt-5 border-t border-gold-100/15 pt-5"><Link href={href(locale, "/blog")} className="text-sm font-semibold text-gold-300 underline underline-offset-4">{locale === "fr" ? "Lire le blog HCIL" : "Read the HCIL blog"} ↗</Link></div>
          </aside>
        </div>
      </div>
    </main>
  );
}
