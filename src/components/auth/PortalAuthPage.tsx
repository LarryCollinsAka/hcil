import Link from "next/link";
import { AUTH_PORTAL_COPY, authPortalPath, type AuthPortal } from "@/modules/identity/auth/portals";
import {
  signInAgencyAction,
  signInBusinessAction,
  signInTalentAction,
  signUpAgencyAction,
  signUpBusinessAction,
  signUpTalentAction,
} from "@/modules/identity/auth/actions";
import type { Locale } from "@/lib/i18n";
import { PasswordInput } from "@/components/auth/PasswordInput";

type FormAction = (rawLocale: string, formData: FormData) => Promise<never>;
const SIGN_IN_ACTIONS: Record<AuthPortal, FormAction> = {
  talent: signInTalentAction,
  business: signInBusinessAction,
  agency: signInAgencyAction,
};
const SIGN_UP_ACTIONS: Record<AuthPortal, FormAction> = {
  talent: signUpTalentAction,
  business: signUpBusinessAction,
  agency: signUpAgencyAction,
};

const ERRORS: Record<string, Record<Locale, string>> = {
  required: { en: "Complete all required fields.", fr: "Veuillez remplir tous les champs obligatoires." },
  "password-short": { en: "Use at least 8 characters, including a letter, a number, and a symbol.", fr: "Utilisez au moins 8 caractères, avec une lettre, un chiffre et un symbole." },
  "password-mismatch": { en: "The passwords do not match.", fr: "Les mots de passe ne correspondent pas." },
  "organization-required": { en: "Enter your organization name.", fr: "Saisissez le nom de votre organisation." },
  "invalid-organization-type": { en: "Choose a valid agency type.", fr: "Choisissez un type d’agence valide." },
  "signup-failed": { en: "We could not create the account. Check the details or try another email address.", fr: "La création du compte a échoué. Vérifiez les informations ou essayez une autre adresse e-mail." },
  "profile-setup": { en: "Account access worked, but HCIL profile setup needs attention. Please contact support.", fr: "L’accès au compte fonctionne, mais la configuration du profil HCIL nécessite une vérification. Contactez l’assistance." },
  invalid: { en: "Enter your email and password.", fr: "Saisissez votre adresse e-mail et votre mot de passe." },
  "invalid-credentials": { en: "We could not sign you in. Check your details and try again.", fr: "Connexion impossible. Vérifiez vos identifiants puis réessayez." },
  "recovery-expired": { en: "Your recovery link may have expired. Request a new one.", fr: "Votre lien de récupération a peut-être expiré. Demandez-en un nouveau." },
};

const fieldClass = "w-full rounded-2xl border border-green-950/15 bg-gold-50 px-4 py-3 text-sm text-green-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15";
const labelClass = "mb-1.5 block text-sm font-semibold text-green-950";

export function PortalAuthPage({
  locale,
  portal,
  mode,
  error,
}: {
  locale: Locale;
  portal: AuthPortal;
  mode: "sign-in" | "sign-up";
  error?: string;
}) {
  const fr = locale === "fr";
  const copy = AUTH_PORTAL_COPY[locale][portal];
  const isSignup = mode === "sign-up";
  const action = (isSignup ? SIGN_UP_ACTIONS : SIGN_IN_ACTIONS)[portal].bind(null, locale);
  const heading = isSignup ? copy.signUpTitle : copy.signInTitle;
  const description = isSignup ? copy.signUpDescription : copy.signInDescription;

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-green-950/10 bg-white p-6 shadow-[0_24px_70px_-35px_rgba(0,22,17,0.35)] sm:p-10">
        <div className="inline-flex rounded-full bg-gold-100 px-3 py-1.5 text-xs font-bold text-green-950">HCIL · {copy.label}</div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-green-950 sm:text-4xl">{heading}</h1>
        <p className="mt-3 text-sm leading-6 text-green-950/70">{description}</p>
        {error && ERRORS[error]?.[locale] ? <p role="alert" className="mt-5 rounded-2xl border border-red-600/20 bg-red-50 px-4 py-3 text-sm text-red-800">{ERRORS[error][locale]}</p> : null}

        <form action={action} className="mt-7 space-y-4">
          {isSignup ? (
            <>
              <div>
                <label htmlFor="full_name" className={labelClass}>{copy.name}</label>
                <input id="full_name" name="full_name" required autoComplete="name" maxLength={120} className={fieldClass} />
              </div>
              {portal !== "talent" ? (
                <>
                  <div>
                    <label htmlFor="organization_name" className={labelClass}>{copy.orgName}</label>
                    <input id="organization_name" name="organization_name" required autoComplete="organization" minLength={2} maxLength={160} className={fieldClass} />
                  </div>
                  <div>
                    <label htmlFor="organization_type" className={labelClass}>{fr ? "Type d’organisation" : "Organization type"}</label>
                    <select id="organization_type" name="organization_type" required defaultValue={portal === "agency" ? "staffing_agency" : "employer"} className={fieldClass}>
                      {portal === "business" ? (
                        <>
                          <option value="employer">{fr ? "Entreprise / employeur" : "Business / employer"}</option>
                          <option value="ngo">ONG / NGO</option>
                          <option value="public_sector">{fr ? "Secteur public" : "Public sector"}</option>
                          <option value="educational_institution">{fr ? "Établissement de formation" : "Educational institution"}</option>
                          <option value="artisan_association">{fr ? "Association d’artisans" : "Artisan association"}</option>
                          <option value="cooperative">{fr ? "Coopérative" : "Cooperative"}</option>
                          <option value="other">{fr ? "Autre organisation" : "Other organization"}</option>
                        </>
                      ) : (
                        <>
                          <option value="staffing_agency">{fr ? "Agence de travail temporaire" : "Staffing agency"}</option>
                          <option value="recruitment_agency">{fr ? "Cabinet de recrutement" : "Recruitment agency"}</option>
                        </>
                      )}
                    </select>
                  </div>
                </>
              ) : null}
            </>
          ) : null}

          <div>
            <label htmlFor="email" className={labelClass}>{fr ? "Adresse e-mail" : "Email address"}</label>
            <input id="email" name="email" type="email" required autoComplete="email" maxLength={254} className={fieldClass} />
          </div>
          <PasswordInput id="password" name="password" label={fr ? "Mot de passe" : "Password"} locale={locale} autoComplete={isSignup ? "new-password" : "current-password"} showStrength={isSignup} className={fieldClass.replace("px-4", "px-4 pr-20")} />
          {isSignup ? (
            <PasswordInput id="confirm_password" name="confirm_password" label={fr ? "Confirmer le mot de passe" : "Confirm password"} locale={locale} confirm className={fieldClass.replace("px-4", "px-4 pr-20")} />
          ) : (
            <div className="text-right"><Link href={`/${locale}/auth/forgot-password?portal=${portal}`} className="text-sm font-semibold text-green-700 underline decoration-green-700/30 underline-offset-4">{fr ? "Mot de passe oublié ?" : "Forgot password?"}</Link></div>
          )}

          <button type="submit" className="w-full rounded-full bg-green-950 px-5 py-3.5 text-sm font-bold text-gold-100 transition hover:bg-green-800">{isSignup ? copy.cta : copy.signInCta}</button>
        </form>

        {isSignup ? <p className="mt-4 text-xs leading-5 text-green-950/60">{copy.reassurance}</p> : null}
        <p className="mt-6 text-center text-sm text-green-950/70">
          {isSignup ? (fr ? "Vous avez déjà un compte ?" : "Already have an account?") : (fr ? "Pas encore de compte ?" : "New to HCIL?")} {" "}
          <Link href={authPortalPath(locale, portal, isSignup ? "sign-in" : "sign-up")} className="font-bold text-green-800 underline underline-offset-4">{isSignup ? (fr ? "Se connecter" : "Sign in") : (fr ? "Créer un compte" : "Create account")}</Link>
        </p>
        <p className="mt-4 text-center text-sm"><Link href={`/${locale}/auth/${mode}`} className="font-semibold text-green-800 underline decoration-green-800/30 underline-offset-4">{fr ? "Choisir un autre espace" : "Choose a different portal"}</Link></p>
      </section>
    </main>
  );
}
