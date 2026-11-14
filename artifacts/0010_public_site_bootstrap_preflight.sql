-- READ-ONLY preflight for the public-site bootstrap.
-- Run this first in the Production SQL editor; do not run the seed unless the results
-- match the expected empty/reference-data state and any conflicts are understood.

-- A) Existing canonical language rows that could conflict with the two site locales.
SELECT id, iso_639_3, iso_639_1, name, status
FROM public.languages
WHERE iso_639_3 IN ('eng', 'fra') OR iso_639_1 IN ('en', 'fr')
ORDER BY iso_639_3;

-- B) Existing locale rows and default-locale assignment.
SELECT id, tag, label, status, is_default, fallback_locale_id, language_id
FROM public.platform_locales
ORDER BY lower(tag);

-- C) Existing homepage page/translations and root-path collisions.
SELECT p.id, p.key, pt.locale_id, pl.tag, pt.path, pt.title, pt.status,
       pt.blocks_version, jsonb_typeof(pt.blocks) AS blocks_type,
       jsonb_typeof(pt.blocks) = 'array' AS blocks_is_array
FROM public.pages p
LEFT JOIN public.page_translations pt ON pt.page_id = p.id
LEFT JOIN public.platform_locales pl ON pl.id = pt.locale_id
WHERE p.key = 'home'
ORDER BY pl.tag;

SELECT pl.tag, p.key, pt.path
FROM public.page_translations pt
JOIN public.platform_locales pl ON pl.id = pt.locale_id
JOIN public.pages p ON p.id = pt.page_id
WHERE lower(pl.tag) IN ('en', 'fr') AND pt.path = '/' AND p.key <> 'home';

-- D) Table counts for the public-site bootstrap scope.
SELECT 'languages' AS table_name, count(*) AS row_count FROM public.languages
UNION ALL SELECT 'platform_locales', count(*) FROM public.platform_locales
UNION ALL SELECT 'pages', count(*) FROM public.pages
UNION ALL SELECT 'page_translations', count(*) FROM public.page_translations
ORDER BY table_name;

-- E) Taxonomy audit triggers expected by reference.ts / architecture docs.
-- The uploaded migration files create taxonomy_audit_log, but do not visibly
-- define the taxonomy_audit() trigger function; verify the live catalog before writes.
SELECT event_object_table AS table_name, trigger_name, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('languages', 'platform_locales')
ORDER BY event_object_table, trigger_name, event_manipulation;

-- F) RLS status for the tables touched by this seed.
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('languages', 'platform_locales', 'pages', 'page_translations')
ORDER BY c.relname;

-- G) Existing profiles: inspect locale references without exposing profile PII.
SELECT pl.tag, count(*) AS profile_count
FROM public.profiles pr
LEFT JOIN public.platform_locales pl ON pl.id = pr.locale_id
GROUP BY pl.tag
ORDER BY pl.tag NULLS FIRST;

SELECT count(*) AS profiles_with_unresolved_locale_reference
FROM public.profiles pr
LEFT JOIN public.platform_locales pl ON pl.id = pr.locale_id
WHERE pr.locale_id IS NOT NULL AND pl.id IS NULL;
