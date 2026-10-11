import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/i18n";
import { getAboutNav, type AboutSlug } from "@/content/about";

export function AboutSubnav({ locale, active }: { locale: Locale; active: AboutSlug }) {
  const items = getAboutNav(locale);
  return (
    <nav aria-label={locale === "fr" ? "Navigation À propos" : "About navigation"} className="mt-8 flex flex-wrap gap-2">
      {items.map((item) => (
        <Link key={item.slug} href={href(locale, item.path)} aria-current={item.slug === active ? "page" : undefined}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${item.slug === active ? "border-green-950 bg-green-950 text-gold-100" : "border-green-950/15 bg-white/50 text-green-950 hover:bg-gold-200/70"}`}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
