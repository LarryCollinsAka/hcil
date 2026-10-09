import { BlockRenderer } from "@/components/home/BlockRenderer";
import { getHomeBlocks } from "@/content/home";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const blocks = await getHomeBlocks(loc);

  return (
    <main id="main">
      <BlockRenderer blocks={blocks} />
    </main>
  );
}
