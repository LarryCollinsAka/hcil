import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticle } from "@/components/blog/BlogArticle";
import { getBlogPost, getBlogPosts } from "@/content/blog";
import { BRAND } from "@/config/brand";
import { DEFAULT_LOCALE, isLocale, LOCALES } from "@/lib/i18n";

export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.flatMap((locale) => getBlogPosts(locale).map((post) => ({ locale, slug: post.slug })));
}
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const post = getBlogPost(loc, slug);
  return post ? { title: `${post.title} · ${BRAND.name}`, description: post.excerpt, alternates: { canonical: `/${loc}/blog/${slug}`, languages: { en: `/en/blog/${slug}`, fr: `/fr/blog/${slug}`, "x-default": `/en/blog/${slug}` } } } : { title: BRAND.name };
}
export default async function BlogArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const post = getBlogPost(locale, slug);
  if (!post) notFound();
  return <BlogArticle locale={locale} post={post} />;
}
