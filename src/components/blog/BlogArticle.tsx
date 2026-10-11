import Link from "next/link";
import type { BlogPost } from "@/content/blog";
import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/i18n";
import { container } from "@/components/site/ui";

export function BlogArticle({ locale, post }: { locale: Locale; post: BlogPost }) {
  return (
    <main id="main" className="pb-24">
      <section className="bg-gold-100 py-14 sm:py-20"><div className={`${container} max-w-4xl`}>
        <Link href={href(locale, "/blog")} className="text-sm font-semibold text-green-800 hover:underline">← {locale === "fr" ? "Tous les articles" : "All articles"}</Link>
        <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-semibold text-green-800"><span className="rounded-full bg-gold-500 px-3 py-1">{post.category}</span><span>{post.readingMinutes} {locale === "fr" ? "min de lecture" : "min read"}</span><span>{locale === "fr" ? "Brouillon de démonstration" : "Demo editorial draft"}</span></div>
        <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl">{post.title}</h1>
        <p className="mt-6 max-w-3xl text-xl leading-relaxed text-green-900/85">{post.excerpt}</p>
      </div></section>
      <article className={`${container} max-w-4xl pt-12 sm:pt-16`}>
        <div className="mb-8 rounded-2xl border border-green-950/10 bg-gold-50 px-4 py-3 text-sm text-green-900/80">{locale === "fr" ? "Contenu de démonstration — ne constitue pas une déclaration de résultats mesurés ni de partenariat officiel." : "Demo content — not a claim of measured results or official partnership."}</div>
        <div className="space-y-10">{post.sections.map((section) => <section key={section.heading}><h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{section.heading}</h2>{section.paragraphs.map((paragraph, index) => <p key={index} className="mt-4 text-base leading-8 text-green-900/85">{paragraph}</p>)}{section.bullets && <ul className="mt-4 space-y-3">{section.bullets.map((bullet) => <li key={bullet} className="flex gap-3 leading-relaxed text-green-900/85"><span className="mt-2 size-2 shrink-0 rounded-full bg-red-600"/><span>{bullet}</span></li>)}</ul>}</section>)}</div>
        {post.sourceLinks?.length ? <section className="mt-12 border-t border-green-950/10 pt-8"><h2 className="text-xl font-semibold">{locale === "fr" ? "Sources" : "Sources"}</h2><ul className="mt-4 space-y-2">{post.sourceLinks.map((source) => <li key={source.url}><a className="text-sm font-semibold text-green-800 underline decoration-gold-600 underline-offset-4" href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a></li>)}</ul></section> : null}
        <div className="mt-12 rounded-3xl bg-green-950 p-7 text-gold-50 sm:p-9"><p className="text-xs font-bold uppercase tracking-[0.17em] text-gold-400">{locale === "fr" ? "Continuer l’exploration" : "Keep exploring"}</p><h2 className="mt-3 text-2xl font-semibold">{locale === "fr" ? "Comprendre le modèle HCIL" : "Understand the HCIL model"}</h2><p className="mt-2 text-sm leading-relaxed text-gold-100/75">{locale === "fr" ? "Découvrez la mission, l’architecture d’intelligence et les cadres de référence." : "Explore the mission, intelligence architecture and policy context."}</p><Link href={href(locale, "/about/intelligence")} className="mt-5 inline-flex rounded-full bg-gold-500 px-5 py-3 text-sm font-semibold text-green-950">{locale === "fr" ? "Comment fonctionne l’intelligence" : "How intelligence works"} ↗</Link></div>
      </article>
    </main>
  );
}
