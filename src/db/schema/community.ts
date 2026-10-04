// src/db/schema/community.ts
// Forums.
//
// Two different language questions:
//  - Forum CHROME (category names/descriptions) is admin-authored, so it is translated per platform locale.
//  - Forum CONTENT (threads, posts) is user-written. It is NOT translated by default; each thread and
//    post records the language it was written in (any registered language, not only UI locales, so
//    people can write in Pidgin or Ewondo). Machine-translation caching is deferred.

import {
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  boolean,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import {
  createdAt,
  slugFormat,
  translationMeta,
  updatedAt,
  valuesIn,
} from "./_shared";
import { profiles } from "./identity";
import { languages, platformLocales } from "./reference";

// Moderation states drive code paths, so these are enums.
export const forumThreadStatus = pgEnum("forum_thread_status", [
  "open",
  "locked",
  "hidden",
]);
export const forumPostStatus = pgEnum("forum_post_status", [
  "visible",
  "hidden",
  "removed",
]);
export const forumReportStatus = pgEnum("forum_report_status", [
  "open",
  "resolved",
  "dismissed",
]);

export const forumCategories = pgTable(
  "forum_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isLocked: boolean("is_locked").notNull().default(false), // no new threads
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("forum_categories_key_uq").on(t.key),
    slugFormat("forum_categories_key_ck", t.key),
  ],
);

export const forumCategoryTranslations = pgTable(
  "forum_category_translations",
  {
    categoryId: uuid("category_id")
      .notNull()
      .references(() => forumCategories.id, { onDelete: "cascade" }),
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
    uniqueIndex("forum_category_translations_locale_slug_uq").on(
      t.localeId,
      t.slug,
    ),
    slugFormat("forum_category_translations_slug_ck", t.slug),
    valuesIn("forum_category_translations_status_ck", t.status, [
      "draft",
      "review",
      "published",
    ]),
  ],
);

export const forumThreads = pgTable(
  "forum_threads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => forumCategories.id, { onDelete: "restrict" }),
    authorId: uuid("author_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    languageId: uuid("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "restrict" }), // language the thread is written in
    title: text("title").notNull(),
    status: forumThreadStatus("status").notNull().default("open"),
    isPinned: boolean("is_pinned").notNull().default(false),
    // Denormalized for listings; maintained by the app when posts are added or removed.
    replyCount: integer("reply_count").notNull().default(0),
    lastPostAt: timestamp("last_post_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("forum_threads_listing_idx").on(t.categoryId, t.lastPostAt),
    index("forum_threads_language_idx").on(t.languageId),
    index("forum_threads_author_idx").on(t.authorId),
  ],
);

// The opening post of a thread is simply its earliest post.
export const forumPosts = pgTable(
  "forum_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    threadId: uuid("thread_id")
      .notNull()
      .references(() => forumThreads.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    replyToPostId: uuid("reply_to_post_id").references(
      (): AnyPgColumn => forumPosts.id,
      { onDelete: "set null" },
    ),
    languageId: uuid("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "restrict" }),
    body: text("body").notNull(),
    status: forumPostStatus("status").notNull().default("visible"), // moderation, soft delete
    editedAt: timestamp("edited_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    index("forum_posts_thread_idx").on(t.threadId, t.createdAt),
    index("forum_posts_author_idx").on(t.authorId),
  ],
);

export const forumReports = pgTable(
  "forum_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => forumPosts.id, { onDelete: "cascade" }),
    reporterId: uuid("reporter_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    reason: text("reason").notNull(),
    details: text("details"),
    status: forumReportStatus("status").notNull().default("open"),
    resolvedBy: uuid("resolved_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    index("forum_reports_status_idx").on(t.status, t.createdAt),
    valuesIn("forum_reports_reason_ck", t.reason, [
      "spam",
      "abuse",
      "off_topic",
      "other",
    ]),
  ],
);
