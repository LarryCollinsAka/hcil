import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n";
import { signInAction } from "@/modules/identity/auth/actions";

const ERROR_COPY: Record<string, Record<Locale, string>> = {
  invalid: { en: "Enter your email and password.", fr: "Saisissez votre adresse e-mail et votre mot de passe." },
  "invalid-credentials": { en: "We could not sign you in. Check your details and try again.", fr: "Connexion impossible. Vérifiez vos identifiants puis réessayez." },
  "profile-setup": { en: "Your sign-in worked, but account setup needs attention. Please try again or contact support.", fr: "La connexion a réussi, mais la configuration du compte nécessite une vérification. Réessayez ou contactez l’assistance." },
  "recovery-expired": { en: "Your recovery link may have expired. Request a new one.", fr: "Votre lien de récupération a peut-être expiré. Demandez-en un nouveau." },
};

export default async function SignInPage({
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
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-20">
      <section className="mx-auto max-w-xl rounded-[2rem] border border-green-950/10 bg-white p-6 shadow-[0_24px_70px_-35px_rgba(0,22,17,0.35)] sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">HCIL · {fr ? "Espace membre" : "Member access"}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-green-950 sm:text-4xl">{fr ? "Heureux de vous revoir." : "Welcome back."}</h1>
        <p className="mt-3 text-sm leading-6 text-green-950/70">{fr ? "Connectez-vous pour accéder à vos espaces de travail, à vos missions et à vos activités d’organisation." : "Sign in to access your workspaces, assignments, and organization activity."}</p>

        {error ? <p role="alert" className="mt-5 rounded-2xl border border-red-600/20 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}

        <form action={signInAction.bind(null, locale)} className="mt-7 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-green-950">{fr ? "Adresse e-mail" : "Email address"}</label>
            <input id="email" name="email" type="email" required autoComplete="email" maxLength={254} className="w-full rounded-2xl border border-green-950/15 bg-gold-50 px-4 py-3 text-sm text-green-950 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-700/15" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-green-950">{fr ? "Mot de passe" : "Password"}</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" className="w-full rounded-2xl border border-green-950/15 bg-gold-50 px-4 py-3 text-sm text-green-950 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-700/15" />
            <div className="mt-2 text-right"><Link href={`/${locale}/auth/forgot-password`} className="text-sm font-semibold text-green-700 underline decoration-green-700/30 underline-offset-4">{fr ? "Mot de passe oublié ?" : "Forgot password?"}</Link></div>
          </div>
          <button type="submit" className="w-full rounded-full bg-green-950 px-5 py-3.5 text-sm font-bold text-gold-100 transition hover:bg-green-800">{fr ? "Se connecter" : "Sign in"}</button>
        </form>

        <p className="mt-6 text-center text-sm text-green-950/70">{fr ? "Vous n’avez pas encore de compte ?" : "New to HCIL?"} <Link href={`/${locale}/auth/sign-up`} className="font-bold text-green-800 underline underline-offset-4">{fr ? "Créer un compte" : "Create an account"}</Link></p>
      </section>
    </main>
  );
}
