import Link from "next/link";
import { isLocale } from "@/lib/i18n";

export default async function CheckEmailPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const fr = locale === "fr";
  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-20">
      <section className="mx-auto max-w-xl rounded-[2rem] border border-green-950/10 bg-white p-6 text-center shadow-[0_24px_70px_-35px_rgba(0,22,17,0.35)] sm:p-10">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-gold-200 text-xl font-black text-green-950" aria-hidden="true">✓</div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-green-700">HCIL · {fr ? "Vérification" : "Verification"}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-green-950">{fr ? "Vérifiez votre boîte e-mail." : "Check your email."}</h1>
        <p className="mt-3 text-sm leading-6 text-green-950/70">{fr ? "Si la confirmation par e-mail est activée, ouvrez le lien envoyé par HCIL pour terminer l’inscription. Si vous ne le trouvez pas, vérifiez les courriers indésirables." : "If email confirmation is enabled, open the link sent by HCIL to finish registration. If you do not see it, check your spam folder."}</p>
        <Link href={`/${locale}/auth/sign-in`} className="mt-7 inline-flex rounded-full bg-green-950 px-5 py-3 text-sm font-bold text-gold-100 hover:bg-green-800">{fr ? "Aller à la connexion" : "Go to sign in"}</Link>
      </section>
    </main>
  );
}
