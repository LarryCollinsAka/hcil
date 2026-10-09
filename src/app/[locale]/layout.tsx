import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { BRAND } from "@/config/brand";
import { getSiteCopy, metaFor } from "@/content/site";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "@/lib/i18n";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

// Only the locales we support are valid; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fcd116", // flag yellow
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const meta = metaFor(loc);

  return {
    metadataBase: new URL(BRAND.siteUrl),
    title: { default: meta.title, template: `%s · ${BRAND.name}` },
    description: meta.description,
    alternates: {
      canonical: `/${loc}`,
      languages: { ...Object.fromEntries(LOCALES.map((code) => [code, `/${code}`])), "x-default": `/${DEFAULT_LOCALE}` },
    },
    openGraph: {
      type: "website",
      siteName: BRAND.name,
      title: meta.title,
      description: meta.description,
      locale: loc === "fr" ? "fr_CM" : "en_CM",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const copy = getSiteCopy(loc);

  return (
    <html lang={loc} className={inter.variable}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-green-950 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-gold-100"
        >
          {copy.skip}
        </a>
        <Header locale={loc} copy={copy} />
        {children}
        <Footer locale={loc} copy={copy} />
      </body>
    </html>
  );
}
