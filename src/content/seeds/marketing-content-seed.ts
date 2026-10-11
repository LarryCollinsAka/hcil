/**
 * Schema-neutral editorial seed dataset for the HCIL content module.
 * All records are demonstration data and should be inserted as drafts until reviewed.
 * Map these typed records through the existing Drizzle content schema; do not create
 * duplicate CMS tables or bypass the content module's published-state/translation rules.
 */
import { getAboutPage, ABOUT_SECTIONS, type AboutSlug } from "@/content/about";
import { BLOG_SEED_RECORDS } from "@/content/blog";
import type { Locale } from "@/lib/i18n";

export const DEMO_SEED_MARKER = "hcil-demo-content-v1";
export const DEMO_SEED_STATUS = "draft" as const;

export function getEditorialSeedData(locale: Locale) {
  const about = (["overview", ...ABOUT_SECTIONS] as AboutSlug[]).map((slug) => getAboutPage(locale, slug));
  const blog = BLOG_SEED_RECORDS[locale];
  return {
    marker: DEMO_SEED_MARKER,
    status: DEMO_SEED_STATUS,
    locale,
    pages: about.map((page) => ({
      seedKey: `${DEMO_SEED_MARKER}:page:${page.slug}:${locale}`,
      slug: page.slug === "overview" ? "about" : `about/${page.slug}`,
      locale,
      title: page.title,
      summary: page.intro,
      content: page,
      status: DEMO_SEED_STATUS,
    })),
    posts: blog.map((post) => ({
      seedKey: `${DEMO_SEED_MARKER}:blog:${post.slug}:${locale}`,
      slug: post.slug,
      locale,
      title: post.title,
      summary: post.excerpt,
      content: post,
      category: post.category,
      status: DEMO_SEED_STATUS,
      publishedAt: null,
    })),
  };
}
