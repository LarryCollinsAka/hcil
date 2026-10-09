import { homepageEn } from "./homepage.en";
import { homepageFr } from "./homepage.fr";
import type { HomepageDocument, HomepageLocale } from "./types";

const localDocuments: Record<HomepageLocale, HomepageDocument> = {
  en: homepageEn,
  fr: homepageFr,
};

/**
 * Single content-source seam for the homepage.
 * Today this reads local typed fixtures. Later, replace the body with a server-side
 * query to page_translations.blocks and validate the result against HomepageDocument.
 * Keep the return contract stable so the UI renderer does not change when Supabase arrives.
 */
export async function getHomepageDocument(locale: HomepageLocale): Promise<HomepageDocument> {
  return localDocuments[locale] ?? localDocuments.en;
}

export { type HomepageBlock, type HomepageDocument, type HomepageLocale } from "./types";
