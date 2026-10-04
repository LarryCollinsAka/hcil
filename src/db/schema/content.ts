// src/db/schema/content.ts
// Site content that admins/editors manage in the database: pages (home, about, legal) and blog.
//
// Pattern for every translatable entity:
//   <entity>               language-neutral facts (ids, author, category, flags)
//   <entity>_translations  one row per (entity, platform locale) with the actual text
//
// Publishing happens per translation, so French can go live before English.
// Reading rule: requested locale -> its fallback locale -> default locale, published rows only.
//
// App UI strings (buttons, labels, errors) live in code (message files), not here.

import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  createdAt,
  slugFormat,
  translationMeta,
  updatedAt,
  valuesIn,
} from "./_shared";
import { profiles } from "./identity";
import { platformLocales } from "./reference";

// Shape validated in the app (e.g. with Zod), versioned by blocks_version.
export type ContentBlock = { type: string; props: Record<string, unknown> };

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(), // stable identifier used by code: "home", "about", "privacy", "terms"
    template: text("template").notNull().default("default"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("pages_key_uq").on(t.key),
    slugFormat("pages_key_ck", t.key),
  ],
);

export const pageTranslations = pgTable(
  "page_translations",
  {
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    localeId: uuid("locale_id")
      .notNull()
      .references(() => platformLocales.id, { onDelete: "restrict" }),
    // Path inside the locale, translated for SEO: "/" , "/about" vs "/a-propos".
    path: text("path").notNull(),
    title: text("title").notNull(),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    blocks: jsonb("blocks")
      .$type<ContentBlock[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    blocksVersion: integer("blocks_version").notNull().default(1),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    updatedBy: uuid("updated_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    ...translationMeta(),
  },
  (t) => [
    primaryKey({ columns: [t.pageId, t.localeId] }),
    uniqueIndex("page_translations_locale_path_uq").on(t.localeId, t.path),
    valuesIn("page_translations_status_ck", t.status, [
      "draft",
      "review",
      "published",
    ]),
    check("page_translations_path_ck", sql`${t.path} like '/%'`),
    check(
      "page_translations_published_ck",
      sql`${t.status} <> 'published' or ${t.publishedAt} is not null`,
    ),
  ],
);

/* ------------------------------------------------------------------ */
/* Blog                                                                */
/* ------------------------------------------------------------------ */

export const postCategories = pgTable(
  "post_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("post_categories_key_uq").on(t.key),
    slugFormat("post_categories_key_ck", t.key),
  ],
);

export const postCategoryTranslations = pgTable(
  "post_category_translations",
  {
    categoryId: uuid("category_id")
      .notNull()
      .references(() => postCategories.id, { onDelete: "cascade" }),
    localeId: uuid("locale_id")
      .notNull()
      .references(() => platformLocales.id, { onDelete: "restrict" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    ...translationMeta(),
  },
  (t) => [
    primaryKey({ columns: [t.categoryId, t.localeId] }),
    uniqueIndex("post_category_translations_locale_slug_uq").on(
      t.localeId,
      t.slug,
    ),
    slugFormat("post_category_translations_slug_ck", t.slug),
    valuesIn("post_category_translations_status_ck", t.status, [
      "draft",
      "review",
      "published",
    ]),
  ],
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("author_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    categoryId: uuid("category_id").references(() => postCategories.id, {
      onDelete: "set null",
    }),
    // The locale the post was originally written in; other translations derive from it.
    sourceLocaleId: uuid("source_locale_id")
      .notNull()
      .references(() => platformLocales.id, { onDelete: "restrict" }),
    coverImageUrl: text("cover_image_url"), // Supabase Storage URL
    isFeatured: boolean("is_featured").notNull().default(false),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("posts_category_idx").on(t.categoryId),
    index("posts_author_idx").on(t.authorId),
  ],
);

export const postTranslations = pgTable(
  "post_translations",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    localeId: uuid("locale_id")
      .notNull()
      .references(() => platformLocales.id, { onDelete: "restrict" }),
    slug: text("slug").notNull(), // unique per locale, translated for SEO
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    bodyMarkdown: text("body_markdown").notNull(),
    coverAlt: text("cover_alt"), // image alt text must be translated too
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...translationMeta(),
  },
  (t) => [
    primaryKey({ columns: [t.postId, t.localeId] }),
    uniqueIndex("post_translations_locale_slug_uq").on(t.localeId, t.slug),
    index("post_translations_listing_idx").on(
      t.localeId,
      t.status,
      t.publishedAt,
    ),
    slugFormat("post_translations_slug_ck", t.slug),
    valuesIn("post_translations_status_ck", t.status, [
      "draft",
      "review",
      "published",
    ]),
    check(
      "post_translations_published_ck",
      sql`${t.status} <> 'published' or ${t.publishedAt} is not null`,
    ),
  ],
);
