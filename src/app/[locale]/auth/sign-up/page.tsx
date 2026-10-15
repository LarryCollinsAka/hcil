import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { AuthPortalChooser } from "@/components/auth/AuthPortalChooser";

export default async function SignUpChooserPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <AuthPortalChooser locale={locale} mode="sign-up" />;
}
