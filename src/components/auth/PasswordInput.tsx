"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

type Props = {
  id: string;
  name: string;
  label: string;
  locale: Locale;
  autoComplete?: string;
  confirm?: boolean;
  showStrength?: boolean;
  required?: boolean;
  className?: string;
};

const defaultClass = "w-full rounded-2xl border border-green-950/15 bg-gold-50 px-4 py-3 pr-20 text-sm text-green-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15";

export function PasswordInput({
  id, name, label, locale, autoComplete = "new-password", confirm = false,
  showStrength = false, required = true, className = defaultClass,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const fr = locale === "fr";
  const checks = [
    { label: fr ? "8 caractères minimum" : "At least 8 characters", valid: value.length >= 8 },
    { label: fr ? "Au moins une lettre" : "At least one letter", valid: /\p{L}/u.test(value) },
    { label: fr ? "Au moins un chiffre" : "At least one number", valid: /\d/.test(value) },
    { label: fr ? "Au moins un symbole" : "At least one symbol", valid: /[^\p{L}\p{N}]/u.test(value) },
  ];
  const validCount = checks.filter((check) => check.valid).length;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-green-950">{label}</label>
      <div className="relative">
        <input
          id={id} name={name} type={visible ? "text" : "password"} required={required}
          minLength={showStrength ? 8 : undefined} autoComplete={autoComplete}
          value={showStrength ? value : undefined} onChange={showStrength ? (event) => setValue(event.target.value) : undefined}
          aria-describedby={showStrength ? `${id}-requirements` : undefined}
          className={className}
        />
        <button type="button" onClick={() => setVisible((current) => !current)}
          aria-label={visible ? (fr ? "Masquer le mot de passe" : "Hide password") : (fr ? "Afficher le mot de passe" : "Show password")}
          className="absolute inset-y-0 right-2 my-auto h-9 rounded-xl px-2.5 text-xs font-bold text-green-800 hover:bg-gold-200/70">
          {visible ? (fr ? "Masquer" : "Hide") : (fr ? "Afficher" : "Show")}
        </button>
      </div>
      {showStrength ? (
        <div id={`${id}-requirements`} className="mt-3 space-y-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-green-950/10" aria-label={fr ? "Force du mot de passe" : "Password strength"}>
            <div className={`h-full rounded-full transition-all ${validCount === 4 ? "bg-green-600" : validCount >= 2 ? "bg-gold-600" : "bg-red-600"}`} style={{ width: `${validCount * 25}%` }} />
          </div>
          <ul className="grid gap-1 text-xs sm:grid-cols-2">
            {checks.map((check) => <li key={check.label} className={check.valid ? "text-green-700" : "text-green-950/55"}>
              <span aria-hidden="true">{check.valid ? "✓" : "○"}</span> {check.label}
            </li>)}
          </ul>
        </div>
      ) : null}
      {confirm ? <p className="mt-1.5 text-xs text-green-950/55">{fr ? "Saisissez exactement le même mot de passe." : "Enter exactly the same password again."}</p> : null}
    </div>
  );
}
