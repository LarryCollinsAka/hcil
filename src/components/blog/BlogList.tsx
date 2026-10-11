import { container } from "@/components/site/ui";
import { BlogCard } from "./BlogCard";
import type { BlogPost } from "@/content/blog";
import type { Locale } from "@/lib/i18n";

export function BlogList({ locale, posts }: { locale: Locale; posts: BlogPost[] }) {
  return (
    <main id="main" className="pb-24">
      <section className="bg-gold-100 py-16 sm:py-24"><div className={container}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">{locale === "fr" ? "Notes et idées" : "Notes & ideas"}</p>
        <h1 className="mt-5 max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl">{locale === "fr" ? "Le blog HCIL" : "The HCIL journal"}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-green-900/85">{locale === "fr" ? "Des idées sur les compétences, le travail découpé en livrables, l’intelligence organisationnelle et le développement du capital humain." : "Ideas on capability, work structured around deliverables, organizational intelligence, and human-capital development."}</p>
        <div className="mt-6 rounded-2xl border border-green-950/10 bg-gold-50/80 px-4 py-3 text-sm text-green-900/80"><strong>{locale === "fr" ? "Aperçu éditorial : " : "Editorial preview: "}</strong>{locale === "fr" ? "Ces articles sont des contenus de démonstration. Vérifier chaque référence et faire une revue éditoriale avant publication officielle." : "These are demonstration articles. Verify references and complete editorial review before official publication."}</div>
      </div></section>
      <section className={`${container} pt-12 sm:pt-16`}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{posts.map((post) => <BlogCard key={post.slug} locale={locale} post={post}/>)}</div></section>
    </main>
  );
}
