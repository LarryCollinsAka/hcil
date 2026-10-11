import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutPageView } from "@/components/about/AboutPageView";
import { ABOUT_SECTIONS, getAboutPage, type AboutSlug } from "@/content/about";
import { BRAND } from "@/config/brand";
import { DEFAULT_LOCALE, isLocale, LOCALES } from "@/lib/i18n";

export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.flatMap((locale) => ABOUT_SECTIONS.map((section) => ({ locale, section })));
}
export async function generateMetadata({ params }: { params: Promise<{ locale: string; section: string }> }): Promise<Metadata> {
  const { locale, section } = await params;
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE;
  if (!(ABOUT_SECTIONS as readonly string[]).includes(section)) return { title: BRAND.name };
  const page = getAboutPage(loc, section as AboutSlug);
  return { title: `${page.title} · ${BRAND.name}`, description: page.intro, alternates: { canonical: `/${loc}/about/${section}`, languages: { en: `/en/about/${section}`, fr: `/fr/about/${section}`, "x-default": `/en/about/${section}` } } };
}
export default async function AboutSectionPage({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale, section } = await params;
  if (!isLocale(locale) || !(ABOUT_SECTIONS as readonly string[]).includes(section)) notFound();
  const slug = section as AboutSlug;
  return <AboutPageView locale={locale} active={slug} page={getAboutPage(locale, slug)} />;
}
