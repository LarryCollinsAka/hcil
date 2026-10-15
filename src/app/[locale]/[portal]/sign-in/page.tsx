import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { isAuthPortal } from "@/modules/identity/auth/portals";
import { PortalAuthPage } from "@/components/auth/PortalAuthPage";

export default async function PortalSignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; portal: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const { locale, portal } = await params;
  if (!isLocale(locale) || !isAuthPortal(portal)) notFound();
  const query = await searchParams;
  return <PortalAuthPage locale={locale} portal={portal} mode="sign-in" error={query?.error} />;
}
