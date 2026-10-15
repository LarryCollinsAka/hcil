import Link from "next/link";
import { isLocale } from "@/lib/i18n";
import { requestPasswordResetAction } from "@/modules/identity/auth/actions";

export default async function ForgotPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ sent?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const fr = locale === "fr";
  const query = await searchParams;

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-20">
      <section className="mx-auto max-w-xl rounded-[2rem] border border-green-950/10 bg-white p-6 shadow-[0_24px_70px_-35px_rgba(0,22,17,0.35)] sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">HCIL · {fr ? "Récupération" : "Account recovery"}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-green-950">{fr ? "Réinitialiser le mot de passe" : "Reset your password"}</h1>
        <p className="mt-3 text-sm leading-6 text-green-950/70">{fr ? "Saisissez votre adresse e-mail. Si un compte correspondant existe, vous recevrez un lien de récupération." : "Enter your email. If a matching account exists, you will receive a recovery link."}</p>
        {query?.sent === "1" ? <p role="status" className="mt-5 rounded-2xl border border-green-700/20 bg-green-50 px-4 py-3 text-sm text-green-900">{fr ? "Si l’adresse correspond à un compte, un lien a été envoyé. Vérifiez également vos courriers indésirables." : "If the address matches an account, a link has been sent. Check your spam folder too."}</p> : null}
        <form action={requestPasswordResetAction.bind(null, locale)} className="mt-7 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-green-950">{fr ? "Adresse e-mail" : "Email address"}</label>
            <input id="email" name="email" type="email" required autoComplete="email" maxLength={254} className="w-full rounded-2xl border border-green-950/15 bg-gold-50 px-4 py-3 text-sm text-green-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15" />
          </div>
          <button type="submit" className="w-full rounded-full bg-green-950 px-5 py-3.5 text-sm font-bold text-gold-100 transition hover:bg-green-800">{fr ? "Envoyer le lien" : "Send recovery link"}</button>
        </form>
        <p className="mt-6 text-center text-sm"><Link href={`/${locale}/auth/sign-in`} className="font-semibold text-green-800 underline underline-offset-4">{fr ? "Retour à la connexion" : "Back to sign in"}</Link></p>
      </section>
    </main>
  );
}
