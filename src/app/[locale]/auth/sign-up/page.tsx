import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n";
import { signUpAction } from "@/modules/identity/auth/actions";

const ERROR_COPY: Record<string, Record<Locale, string>> = {
  required: { en: "Complete all required fields.", fr: "Veuillez remplir tous les champs obligatoires." },
  "password-short": { en: "Use a password with at least 10 characters.", fr: "Utilisez un mot de passe d’au moins 10 caractères." },
  "password-mismatch": { en: "The passwords do not match.", fr: "Les mots de passe ne correspondent pas." },
  "invalid-account-type": { en: "Choose a valid account type.", fr: "Choisissez un type de compte valide." },
  "organization-required": { en: "An organization name is required for this account type.", fr: "Le nom de l’organisation est obligatoire pour ce type de compte." },
  "invalid-organization-type": { en: "Choose a valid organization type.", fr: "Choisissez un type d’organisation valide." },
  "signup-failed": { en: "We could not create the account. Check the details or try another email address.", fr: "La création du compte a échoué. Vérifiez les informations ou essayez une autre adresse e-mail." },
  "profile-setup": { en: "The account was created but its HCIL workspace needs setup. Please contact support.", fr: "Le compte a été créé, mais son espace HCIL doit être configuré. Contactez l’assistance." },
};

export default async function SignUpPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return null;
  const locale = rawLocale;
  const query = await searchParams;
  const error = query?.error ? ERROR_COPY[query.error]?.[locale] : undefined;
  const fr = locale === "fr";

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-green-950/10 bg-white p-6 shadow-[0_24px_70px_-35px_rgba(0,22,17,0.35)] sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">HCIL · {fr ? "Créer un compte" : "Create an account"}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-green-950 sm:text-4xl">{fr ? "Commencez par ce que vous souhaitez accomplir." : "Start with what you want to do."}</h1>
        <p className="mt-3 text-sm leading-6 text-green-950/70">{fr ? "Une même personne peut être talent et membre d’une organisation. Les permissions d’équipe seront attribuées séparément et resteront limitées à leur périmètre." : "One person can be both a talent and an organization member. Team permissions are assigned separately and remain scoped to that organization."}</p>
        {error ? <p role="alert" className="mt-5 rounded-2xl border border-red-600/20 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}

        <form action={signUpAction.bind(null, locale)} className="mt-7 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="full_name" className="mb-1.5 block text-sm font-semibold text-green-950">{fr ? "Nom complet" : "Full name"}</label>
              <input id="full_name" name="full_name" required autoComplete="name" maxLength={120} className="w-full rounded-2xl border border-green-950/15 bg-gold-50 px-4 py-3 text-sm text-green-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15" />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-green-950">{fr ? "Adresse e-mail" : "Email address"}</label>
              <input id="email" name="email" type="email" required autoComplete="email" maxLength={254} className="w-full rounded-2xl border border-green-950/15 bg-gold-50 px-4 py-3 text-sm text-green-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15" />
            </div>
          </div>

          <div>
            <label htmlFor="account_type" className="mb-1.5 block text-sm font-semibold text-green-950">{fr ? "Comment souhaitez-vous utiliser HCIL ?" : "How do you want to use HCIL?"}</label>
            <select id="account_type" name="account_type" defaultValue="talent" required className="w-full rounded-2xl border border-green-950/15 bg-gold-50 px-4 py-3 text-sm text-green-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15">
              <option value="talent">{fr ? "Je propose mes compétences (talent)" : "I offer my skills (talent)"}</option>
              <option value="business">{fr ? "Je représente une entreprise ou organisation" : "I represent a business or organization"}</option>
              <option value="agency">{fr ? "Je représente une agence de recrutement ou de talents" : "I represent a recruitment or talent agency"}</option>
              <option value="both">{fr ? "Les deux : talent et organisation" : "Both: talent and organization"}</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="organization_name" className="mb-1.5 block text-sm font-semibold text-green-950">{fr ? "Nom de l’organisation (si applicable)" : "Organization name (if applicable)"}</label>
              <input id="organization_name" name="organization_name" maxLength={160} autoComplete="organization" className="w-full rounded-2xl border border-green-950/15 bg-gold-50 px-4 py-3 text-sm text-green-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15" />
            </div>
            <div>
              <label htmlFor="organization_type" className="mb-1.5 block text-sm font-semibold text-green-950">{fr ? "Type d’organisation (si applicable)" : "Organization type (if applicable)"}</label>
              <select id="organization_type" name="organization_type" defaultValue="employer" className="w-full rounded-2xl border border-green-950/15 bg-gold-50 px-4 py-3 text-sm text-green-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15">
                <option value="employer">{fr ? "Entreprise / employeur" : "Business / employer"}</option>
                <option value="staffing_agency">{fr ? "Agence de travail temporaire" : "Staffing agency"}</option>
                <option value="recruitment_agency">{fr ? "Cabinet de recrutement" : "Recruitment agency"}</option>
                <option value="ngo">ONG / NGO</option>
                <option value="public_sector">{fr ? "Secteur public" : "Public sector"}</option>
                <option value="educational_institution">{fr ? "Établissement de formation" : "Educational institution"}</option>
                <option value="artisan_association">{fr ? "Association d’artisans" : "Artisan association"}</option>
                <option value="cooperative">{fr ? "Coopérative" : "Cooperative"}</option>
                <option value="other">{fr ? "Autre" : "Other"}</option>
              </select>
            </div>
          </div>
          <p className="text-xs leading-5 text-green-950/60">{fr ? "Le nom et le type d’organisation sont obligatoires pour les comptes entreprise, agence et les comptes mixtes. L’inscription ne donne aucun rôle d’administration de la plateforme." : "Organization name and type are required for business, agency, and combined accounts. Registration never grants platform-administrator permissions."}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-green-950">{fr ? "Mot de passe" : "Password"}</label>
              <input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" className="w-full rounded-2xl border border-green-950/15 bg-gold-50 px-4 py-3 text-sm text-green-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15" />
            </div>
            <div>
              <label htmlFor="confirm_password" className="mb-1.5 block text-sm font-semibold text-green-950">{fr ? "Confirmer le mot de passe" : "Confirm password"}</label>
              <input id="confirm_password" name="confirm_password" type="password" required minLength={10} autoComplete="new-password" className="w-full rounded-2xl border border-green-950/15 bg-gold-50 px-4 py-3 text-sm text-green-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15" />
            </div>
          </div>
          <button type="submit" className="w-full rounded-full bg-green-950 px-5 py-3.5 text-sm font-bold text-gold-100 transition hover:bg-green-800">{fr ? "Créer mon compte" : "Create account"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-green-950/70">{fr ? "Vous avez déjà un compte ?" : "Already have an account?"} <Link href={`/${locale}/auth/sign-in`} className="font-bold text-green-800 underline underline-offset-4">{fr ? "Se connecter" : "Sign in"}</Link></p>
      </section>
    </main>
  );
}
