import Link from "next/link";
import { BRAND } from "@/config/brand";
import type { SiteCopy } from "@/content/site";
import { type Locale, href } from "@/lib/i18n";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Logo } from "./Logo";
import { container, tricolor } from "./ui";

export function Footer({ locale, copy }: { locale: Locale; copy: SiteCopy }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-green-950 text-gold-100">
      <div className="flex h-1.5" aria-hidden="true">
        {tricolor.map((color) => (
          <div key={color} className={`flex-1 ${color}`} />
        ))}
      </div>

      <div className={`${container} py-14`}>
        <div className="grid gap-12 md:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo locale={locale} onDark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gold-100/70">{copy.footer.tagline}</p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {copy.footer.groups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">{group.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("#") ? (
                        <a href={link.href} className="text-sm text-gold-100/80 transition hover:text-gold-50">
                          {link.label}
                        </a>
                      ) : (
                        <Link href={href(locale, link.href)} className="text-sm text-gold-100/80 transition hover:text-gold-50">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-gold-100/15 pt-6 text-sm text-gold-100/60 sm:flex-row sm:items-center">
          <p>
            © {year} {BRAND.name}. {copy.footer.rights}
          </p>
          <div className="flex items-center gap-3">
            <span>{copy.footer.language}</span>
            <LocaleSwitcher locale={locale} onDark label={copy.footer.language} />
          </div>
        </div>
      </div>
    </footer>
  );
}
