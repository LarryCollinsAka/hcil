import HomepageClient from "./homepage-client";
import { getHomepageDocument } from "../content/homepage";

/**
 * Server entry point. Homepage copy comes from one content-loader contract.
 * Replace getHomepageDocument's local fixtures with page_translations.blocks
 * when the Supabase content module is ready; the client renderer stays unchanged.
 */
export default async function HomePage() {
  const [en, fr] = await Promise.all([
    getHomepageDocument("en"),
    getHomepageDocument("fr"),
  ]);

  return <HomepageClient documents={{ en, fr }} />;
}
