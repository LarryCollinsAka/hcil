import Link from "next/link";
import { LOCALES, LOCALE_LABELS, type Locale, href } from "@/lib/i18n";

export function LocaleSwitcher({ locale, onDark = false, label = "Language" }: { locale: Locale; onDark?: boolean; label?: string }) {
  const track = onDark ? "bg-gold-100/10" : "bg-gold-200/60";
  const active = onDark ? "bg-gold-500 text-green-950" : "bg-green-950 text-gold-100";
  const idle = onDark ? "text-gold-100/80 hover:text-gold-50" : "text-green-900 hover:text-green-950";

  return (
    <nav aria-label={label} className={`inline-flex rounded-full p-0.5 text-xs font-semibold ${track}`}>
      {LOCALES.map((code) => (
        <Link
          key={code}
          href={href(code)}
          hrefLang={code}
          lang={code}
          aria-current={code === locale ? "true" : undefined}
          title={LOCALE_LABELS[code].native}
          className={`rounded-full px-2.5 py-1 transition ${code === locale ? active : idle}`}
        >
          {LOCALE_LABELS[code].short}
        </Link>
      ))}
    </nav>
  );
}
