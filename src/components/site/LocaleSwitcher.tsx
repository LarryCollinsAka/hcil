"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { isLocale, LOCALES, LOCALE_LABELS, type Locale, href } from "@/lib/i18n";

function localizedPathname(pathname: string, targetLocale: Locale): string {
  const segments = pathname.split("/");
  const currentLocale = segments[1] ?? "";

  if (isLocale(currentLocale)) {
    segments[1] = targetLocale;
    return segments.join("/") || href(targetLocale);
  }

  // Defensive fallback for a route rendered outside the [locale] segment.
  return pathname === "/" ? href(targetLocale) : href(targetLocale, pathname);
}

export function LocaleSwitcher({
  locale,
  onDark = false,
  label = "Language",
}: {
  locale: Locale;
  onDark?: boolean;
  label?: string;
}) {
  const pathname = usePathname() || href(locale);
  const router = useRouter();
  const track = onDark ? "bg-gold-100/10" : "bg-gold-200/60";
  const active = onDark ? "bg-gold-500 text-green-950" : "bg-green-950 text-gold-100";
  const idle = onDark ? "text-gold-100/80 hover:text-gold-50" : "text-green-900 hover:text-green-950";

  function handleLanguageClick(
    event: MouseEvent<HTMLAnchorElement>,
    targetLocale: Locale,
    targetPath: string,
  ) {
    // Preserve browser-native behavior for open-in-new-tab/window actions.
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    // The active language is not a navigation action. In particular, do not
    // accidentally discard the current search or fragment when it is clicked.
    if (targetLocale === locale) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    const suffix = `${window.location.search}${window.location.hash}`;
    router.push(`${targetPath}${suffix}`);
  }

  return (
    <nav aria-label={label} className={`inline-flex rounded-full p-0.5 text-xs font-semibold ${track}`}>
      {LOCALES.map((code) => {
        const targetPath = localizedPathname(pathname, code);

        return (
          <Link
            key={code}
            href={targetPath}
            hrefLang={code}
            lang={code}
            aria-current={code === locale ? "page" : undefined}
            title={LOCALE_LABELS[code].native}
            onClick={(event) => handleLanguageClick(event, code, targetPath)}
            className={`rounded-full px-2.5 py-1 transition ${code === locale ? active : idle}`}
          >
            {LOCALE_LABELS[code].short}
          </Link>
        );
      })}
    </nav>
  );
}
