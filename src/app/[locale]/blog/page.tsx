import type { Metadata } from "next";
import { BlogList } from "@/components/blog/BlogList";
import { getBlogPosts } from "@/content/blog";
import { BRAND } from "@/config/brand";
import { DEFAULT_LOCALE, isLocale, LOCALES } from "@/lib/i18n";

export const dynamicParams = false;
export function generateStaticParams() { return LOCALES.map((locale) => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return { title: `${loc === "fr" ? "Blog" : "Journal"} · ${BRAND.name}`, description: loc === "fr" ? "Notes sur les compétences, le travail et l’intelligence organisationnelle." : "Notes on capability, work and organizational intelligence.", alternates: { canonical: `/${loc}/blog`, languages: { en: "/en/blog", fr: "/fr/blog", "x-default": "/en/blog" } } };
}
export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return <BlogList locale={loc} posts={getBlogPosts(loc)} />;
}
