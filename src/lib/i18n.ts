// Locales the site can be rendered in. Mirror of the platform_locales table: when the home page
// moves to the database, derive this list from active platform locales instead.

export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

// Used when the visitor's browser does not express a supported preference. Change in one place.
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, { short: string; native: string }> = {
  en: { short: "EN", native: "English" },
  fr: { short: "FR", native: "Français" },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

// Picks the best supported locale from an Accept-Language header, honouring q-values.
export function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return { base: tag.trim().toLowerCase().split("-")[0], q };
    })
    .filter((entry) => entry.base && !Number.isNaN(entry.q) && entry.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { base } of ranked) {
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

// Path inside a locale: href("fr", "/hire") -> "/fr/hire"; href("fr") -> "/fr"
export function href(locale: Locale, path = ""): string {
  return `/${locale}${path}`;
}
