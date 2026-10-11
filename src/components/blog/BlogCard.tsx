import Link from "next/link";
import type { BlogPost } from "@/content/blog";
import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/i18n";

export function BlogCard({ locale, post }: { locale: Locale; post: BlogPost }) {
  return (
    <article className="group flex h-full flex-col rounded-3xl border border-green-950/10 bg-white/55 p-6 transition hover:-translate-y-1 hover:bg-white/85 hover:shadow-xl sm:p-7">
      <div className="flex items-center justify-between gap-3 text-xs text-green-800"><span className="rounded-full bg-gold-200 px-3 py-1 font-semibold">{post.category}</span><span>{post.readingMinutes} {locale === "fr" ? "min de lecture" : "min read"}</span></div>
      <h2 className="mt-5 text-2xl font-semibold leading-tight tracking-tight"><Link href={href(locale, `/blog/${post.slug}`)} className="hover:underline decoration-gold-600 decoration-2 underline-offset-4">{post.title}</Link></h2>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-green-900/80">{post.excerpt}</p>
      <Link href={href(locale, `/blog/${post.slug}`)} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-green-800">{locale === "fr" ? "Lire l’article" : "Read article"} <span aria-hidden="true">↗</span></Link>
    </article>
  );
}
