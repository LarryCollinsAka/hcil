import Link from "next/link";
import type { SiteCopy } from "@/content/site";
import { type Locale, href } from "@/lib/i18n";
import { Icon } from "./Icon";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Logo } from "./Logo";

export function Header({ locale, copy }: { locale: Locale; copy: SiteCopy }) {
  const links = [
    { href: "#how", label: copy.nav.how },
    { href: "#principles", label: copy.nav.principles },
    { href: "#audiences", label: copy.nav.audiences },
    { href: "#faq", label: copy.nav.faq },
  ];

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-green-950/10 bg-gold-50/85 py-2 pl-4 pr-2 shadow-[0_10px_34px_-14px_rgba(0,22,17,0.3)] backdrop-blur-xl">
        <Logo locale={locale} />

        <nav aria-label={copy.primaryNav} className="hidden items-center md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-green-900 transition hover:bg-gold-200/60 hover:text-green-950"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <LocaleSwitcher locale={locale} label={copy.footer.language} />
          <Link
            href={href(locale, "#audiences")}
            className="hidden rounded-full bg-green-950 px-4 py-2 text-sm font-semibold text-gold-100 transition hover:bg-green-800 sm:inline-block"
          >
            {copy.getStarted}
          </Link>

          {/* No-JS mobile menu */}
          <details className="group relative md:hidden">
            <summary
              aria-label={copy.menu}
              className="grid size-10 list-none place-items-center rounded-full bg-gold-200/60 text-green-950 [&::-webkit-details-marker]:hidden"
            >
              <Icon name="menu" className="size-5 group-open:hidden" />
              <Icon name="close" className="hidden size-5 group-open:block" />
            </summary>
            <div className="absolute right-0 top-12 w-64 rounded-3xl border border-green-950/10 bg-gold-50 p-2 shadow-[0_24px_60px_-20px_rgba(0,22,17,0.45)]">
              {links.map((link) => (
                <a key={link.href} href={link.href} className="block rounded-2xl px-4 py-3 text-[15px] font-medium text-green-950 hover:bg-gold-200/60">
                  {link.label}
                </a>
              ))}
              <div className="mt-1 border-t border-green-950/10 p-2 pt-3">
                <Link href={href(locale, "#audiences")} className="block rounded-full bg-green-950 px-4 py-2.5 text-center text-sm font-semibold text-gold-100">
                  {copy.getStarted}
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
