import Link from "next/link";
import { isLocale } from "@/lib/i18n";
import { isAuthPortal, authPortalPath } from "@/modules/identity/auth/portals";
import { updatePasswordAction } from "@/modules/identity/auth/actions";

export default async function UpdatePasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ error?: string; portal?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const fr = locale === "fr";
  const query = await searchParams;
  const portal = isAuthPortal(query?.portal) ? query.portal : null;
  const errorMessage = query?.error === "password-short"
    ? (fr ? "Utilisez au moins 10 caractères." : "Use at least 10 characters.")
    : query?.error === "password-mismatch"
      ? (fr ? "Les mots de passe ne correspondent pas." : "The passwords do not match.")
      : query?.error === "update-failed"
        ? (fr ? "La mise à jour a échoué. Demandez un nouveau lien de récupération." : "Password update failed. Request a new recovery link.")
        : null;
  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-20">
      <section className="mx-auto max-w-xl rounded-[2rem] border border-green-950/10 bg-white p-6 shadow-[0_24px_70px_-35px_rgba(0,22,17,0.35)] sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">HCIL · {fr ? "Sécurité du compte" : "Account security"}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-green-950">{fr ? "Choisir un nouveau mot de passe" : "Choose a new password"}</h1>
        {errorMessage ? <p role="alert" className="mt-5 rounded-2xl border border-red-600/20 bg-red-50 px-4 py-3 text-sm text-red-800">{errorMessage}</p> : null}
        <form action={updatePasswordAction.bind(null, locale)} className="mt-7 space-y-4">
          <input type="hidden" name="portal" value={portal ?? ""} />
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-green-950">{fr ? "Nouveau mot de passe" : "New password"}</label>
            <input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" className="w-full rounded-2xl border border-green-950/15 bg-gold-50 px-4 py-3 text-sm text-green-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15" />
          </div>
          <div>
            <label htmlFor="confirm_password" className="mb-1.5 block text-sm font-semibold text-green-950">{fr ? "Confirmer le mot de passe" : "Confirm password"}</label>
            <input id="confirm_password" name="confirm_password" type="password" required minLength={10} autoComplete="new-password" className="w-full rounded-2xl border border-green-950/15 bg-gold-50 px-4 py-3 text-sm text-green-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15" />
          </div>
          <button type="submit" className="w-full rounded-full bg-green-950 px-5 py-3.5 text-sm font-bold text-gold-100 transition hover:bg-green-800">{fr ? "Mettre à jour" : "Update password"}</button>
        </form>
        <p className="mt-6 text-center text-sm"><Link href={portal ? authPortalPath(locale, portal, "sign-in") : `/${locale}/auth/sign-in`} className="font-semibold text-green-800 underline underline-offset-4">{fr ? "Retour à la connexion" : "Back to sign in"}</Link></p>
      </section>
    </main>
  );
}
