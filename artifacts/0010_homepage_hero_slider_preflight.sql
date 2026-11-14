-- Read-only preflight. Run this before the homepage slider seed.
-- Confirm both public locales exist and are active.
SELECT tag, status, is_default
FROM public.platform_locales
WHERE lower(tag) IN ('en', 'fr')
ORDER BY lower(tag);

-- Confirm the home page and current translations, if any.
SELECT p.id, p.key, pt.locale_id, pl.tag, pt.path, pt.status,
       pt.blocks_version, jsonb_typeof(pt.blocks) AS blocks_type
FROM public.pages p
LEFT JOIN public.page_translations pt ON pt.page_id = p.id
LEFT JOIN public.platform_locales pl ON pl.id = pt.locale_id
WHERE p.key = 'home'
ORDER BY pl.tag;

-- Check whether another page already owns the root path for either locale.
SELECT pl.tag, p.key, pt.path
FROM public.page_translations pt
JOIN public.platform_locales pl ON pl.id = pt.locale_id
JOIN public.pages p ON p.id = pt.page_id
WHERE lower(pl.tag) IN ('en', 'fr')
  AND pt.path = '/'
  AND p.key <> 'home';
