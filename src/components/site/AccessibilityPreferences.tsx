"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { Icon } from "./Icon";

type Preferences = {
  text: "standard" | "large" | "larger";
  spacing: "standard" | "comfortable" | "wide";
  font: "standard" | "alternative";
  contrast: "standard" | "high";
  motion: "system" | "reduced";
};

const defaults: Preferences = {
  text: "standard",
  spacing: "standard",
  font: "standard",
  contrast: "standard",
  motion: "system",
};

const copy = {
  en: {
    open: "Accessibility and display preferences",
    title: "Make this site more comfortable",
    intro: "Adjust how content looks and moves. Your choices are saved on this device.",
    text: "Text size",
    standard: "Standard",
    large: "Large",
    larger: "Extra large",
    spacing: "Reading spacing",
    comfortable: "Comfortable",
    wide: "Extra spacing",
    font: "Typeface",
    usual: "Standard sans serif",
    alternative: "Alternative readable style",
    contrast: "Contrast",
    high: "High contrast",
    motion: "Motion",
    system: "Use device setting",
    reduced: "Reduce motion",
    reset: "Reset preferences",
    close: "Close preferences",
  },
  fr: {
    open: "Préférences d’accessibilité et d’affichage",
    title: "Personnalisez votre confort de lecture",
    intro: "Ajustez l’affichage et les animations. Vos choix sont enregistrés sur cet appareil.",
    text: "Taille du texte",
    standard: "Standard",
    large: "Grande",
    larger: "Très grande",
    spacing: "Espacement du texte",
    comfortable: "Confortable",
    wide: "Espacement augmenté",
    font: "Police de caractères",
    usual: "Sans empattement standard",
    alternative: "Style alternatif lisible",
    contrast: "Contraste",
    high: "Contraste élevé",
    motion: "Animations",
    system: "Paramètre de l’appareil",
    reduced: "Réduire les animations",
    reset: "Réinitialiser les préférences",
    close: "Fermer les préférences",
  },
} as const;

const storageKey = "hcil-accessibility-preferences-v1";

export function AccessibilityPreferences({ locale }: { locale: Locale }) {
  const t = copy[locale === "fr" ? "fr" : "en"];
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Preferences>;
        setPreferences({ ...defaults, ...parsed });
      }
    } catch {
      // Preferences remain usable for this session if storage is unavailable.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.dataset.hcilText = preferences.text;
    root.dataset.hcilSpacing = preferences.spacing;
    root.dataset.hcilFont = preferences.font;
    root.dataset.hcilContrast = preferences.contrast;
    root.dataset.hcilMotion = preferences.motion;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch {
      // Private browsing or storage restrictions must not break the controls.
    }
  }, [preferences, hydrated]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPreferences((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70]">
      {open ? (
        <section
          id="hcil-accessibility-panel"
          aria-labelledby="hcil-accessibility-title"
          aria-describedby="hcil-accessibility-intro"
          className="mb-3 max-h-[min(76vh,42rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-green-950/15 bg-white p-5 text-green-950 shadow-[0_20px_70px_-24px_rgba(0,22,17,0.45)]"
          role="dialog"
          aria-modal="false"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="hcil-accessibility-title" className="text-lg font-semibold">{t.title}</h2>
              <p id="hcil-accessibility-intro" className="mt-1 text-sm leading-relaxed text-green-800">{t.intro}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={t.close} className="grid size-10 shrink-0 place-items-center rounded-full border border-green-950/15 hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-offset-2">
              <Icon name="close" className="size-5" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">{t.text}</legend>
              <div className="grid grid-cols-3 gap-2">
                {(["standard", "large", "larger"] as const).map((value) => (
                  <button key={value} type="button" aria-pressed={preferences.text === value} onClick={() => update("text", value)} className={`min-h-11 rounded-xl border px-2 text-sm font-medium ${preferences.text === value ? "border-green-800 bg-green-50 ring-2 ring-green-700/20" : "border-green-950/15 hover:bg-green-50"}`}>
                    {t[value]}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold">{t.spacing}</legend>
              <div className="grid grid-cols-3 gap-2">
                {(["standard", "comfortable", "wide"] as const).map((value) => (
                  <button key={value} type="button" aria-pressed={preferences.spacing === value} onClick={() => update("spacing", value)} className={`min-h-11 rounded-xl border px-2 text-sm font-medium ${preferences.spacing === value ? "border-green-800 bg-green-50 ring-2 ring-green-700/20" : "border-green-950/15 hover:bg-green-50"}`}>
                    {value === "standard" ? t.standard : value === "comfortable" ? t.comfortable : t.wide}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold">{t.font}</legend>
              <div className="grid grid-cols-1 gap-2">
                {(["standard", "alternative"] as const).map((value) => (
                  <button key={value} type="button" aria-pressed={preferences.font === value} onClick={() => update("font", value)} className={`min-h-11 rounded-xl border px-3 text-left text-sm font-medium ${preferences.font === value ? "border-green-800 bg-green-50 ring-2 ring-green-700/20" : "border-green-950/15 hover:bg-green-50"}`}>
                    {value === "standard" ? t.usual : t.alternative}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold">{t.contrast}</legend>
              <div className="grid grid-cols-2 gap-2">
                {(["standard", "high"] as const).map((value) => (
                  <button key={value} type="button" aria-pressed={preferences.contrast === value} onClick={() => update("contrast", value)} className={`min-h-11 rounded-xl border px-3 text-sm font-medium ${preferences.contrast === value ? "border-green-800 bg-green-50 ring-2 ring-green-700/20" : "border-green-950/15 hover:bg-green-50"}`}>
                    {value === "standard" ? t.standard : t.high}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold">{t.motion}</legend>
              <div className="grid grid-cols-1 gap-2">
                {(["system", "reduced"] as const).map((value) => (
                  <button key={value} type="button" aria-pressed={preferences.motion === value} onClick={() => update("motion", value)} className={`min-h-11 rounded-xl border px-3 text-left text-sm font-medium ${preferences.motion === value ? "border-green-800 bg-green-50 ring-2 ring-green-700/20" : "border-green-950/15 hover:bg-green-50"}`}>
                    {value === "system" ? t.system : t.reduced}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <button type="button" onClick={() => setPreferences(defaults)} className="mt-5 min-h-11 w-full rounded-full border border-green-950/20 px-4 py-2 text-sm font-semibold text-green-900 hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-offset-2">
            {t.reset}
          </button>
        </section>
      ) : null}

      <button
        type="button"
        aria-label={t.open}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-12 items-center gap-2 rounded-full border border-green-950/15 bg-white px-4 py-3 text-sm font-semibold text-green-950 shadow-lg transition hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Icon name="accessibility" className="size-5" />
        <span className="hidden sm:inline">{locale === "fr" ? "Accessibilité" : "Accessibility"}</span>
      </button>
    </div>
  );
}
