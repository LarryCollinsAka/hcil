import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutPageView } from "@/components/about/AboutPageView";
import { getAboutPage } from "@/content/about";
import { BRAND } from "@/config/brand";
import { DEFAULT_LOCALE, isLocale, LOCALES } from "@/lib/i18n";

export const dynamicParams = false;
export function generateStaticParams() { return LOCALES.map((locale) => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const page = getAboutPage(loc, "overview");
  return { title: `${page.title} · ${BRAND.name}`, description: page.intro, alternates: { canonical: `/${loc}/about`, languages: { en: "/en/about", fr: "/fr/about", "x-default": "/en/about" } } };
}
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <AboutPageView locale={locale} active="overview" page={getAboutPage(locale, "overview")} />;
}
