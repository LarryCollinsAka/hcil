-- HCIL public homepage hero slider seed (English + French).
-- Uses the existing pages/page_translations CMS tables; no new schema objects.
-- Safe to re-run: replaces only the hero_slider block and preserves all other blocks.
-- Review image URLs and copy before running in Production.

BEGIN;

INSERT INTO public.pages (key, template)
VALUES ('home', 'default')
ON CONFLICT (key) DO NOTHING;

WITH home_page AS (
  SELECT id FROM public.pages WHERE key = 'home'
), locale_rows AS (
  SELECT id, tag FROM public.platform_locales
  WHERE lower(tag) IN ('en', 'fr') AND status = 'active'
), slide_blocks AS (
  SELECT
    l.id AS locale_id,
    l.tag,
    CASE WHEN lower(l.tag) = 'fr' THEN
      jsonb_build_array(jsonb_build_object(
        'type', 'hero_slider',
        'props', jsonb_build_object(
          'label', 'À la une',
          'slides', jsonb_build_array(
            jsonb_build_object('id','people','eyebrow','Aperçu en accès anticipé · Personnes. Compétences. Opportunités.','title','Faites connaître vos compétences. Trouvez un travail qui les valorise.','description','HCIL aide chacun à montrer ce qu’il sait faire et aide les organisations à comprendre les compétences nécessaires à leurs projets.','imageUrl','https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=85','imageAlt','Une équipe diverse qui travaille ensemble autour d’une table','primary',jsonb_build_object('label','Je cherche des opportunités','href','/fr/auth/sign-up'),'secondary',jsonb_build_object('label','Je recrute ou je forme une équipe','href','#for-companies')),
            jsonb_build_object('id','organizations','eyebrow','Pour les organisations et les équipes','title','Partez du travail à réaliser. Trouvez les personnes capables de le faire.','description','Expliquez simplement le résultat attendu. HCIL est conçu pour aider à organiser le travail et réunir les compétences adaptées.','imageUrl','https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1800&q=85','imageAlt','Des collègues qui planifient un projet ensemble','primary',jsonb_build_object('label','Découvrir le parcours des organisations','href','#for-companies'),'secondary',jsonb_build_object('label','Comment fonctionne HCIL','href','#how')),
            jsonb_build_object('id','learning','eyebrow','Montrez ce que vous savez faire','title','Votre expérience ne se résume pas à un titre ou à un diplôme.','description','Présentez vos compétences à travers l’apprentissage, des évaluations pratiques et des réalisations concrètes.','imageUrl','https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=85','imageAlt','De jeunes adultes qui apprennent et collaborent','primary',jsonb_build_object('label','Créer mon profil talent','href','/fr/auth/sign-up'),'secondary',jsonb_build_object('label','Découvrir notre approche','href','/fr/about'))
          )
        )
      ))
    ELSE
      jsonb_build_array(jsonb_build_object(
        'type', 'hero_slider',
        'props', jsonb_build_object(
          'label', 'Featured stories',
          'slides', jsonb_build_array(
            jsonb_build_object('id','people','eyebrow','Early access preview · People. Skills. Opportunity.','title','Make your abilities visible. Find work that values them.','description','HCIL helps people show what they can do and helps organizations understand the skills behind the work they need done.','imageUrl','https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=85','imageAlt','A diverse team working together around a table','primary',jsonb_build_object('label','I’m looking for opportunities','href','/en/auth/sign-up'),'secondary',jsonb_build_object('label','I’m hiring or building a team','href','#for-companies')),
            jsonb_build_object('id','organizations','eyebrow','For organizations and teams','title','Start with the work. Find the people who can deliver it.','description','Explain the result you need in everyday language. HCIL is being built to help turn that need into clear tasks and bring the right abilities together.','imageUrl','https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1800&q=85','imageAlt','Colleagues planning a project together','primary',jsonb_build_object('label','Explore the employer journey','href','#for-companies'),'secondary',jsonb_build_object('label','How HCIL works','href','#how')),
            jsonb_build_object('id','learning','eyebrow','A stronger way to show what you know','title','Your experience is more than a job title or a certificate.','description','Build a clearer picture of your skills through learning, practical assessments and work you can demonstrate.','imageUrl','https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=85','imageAlt','Young adults learning and collaborating','primary',jsonb_build_object('label','Create your talent profile','href','/en/auth/sign-up'),'secondary',jsonb_build_object('label','Discover our approach','href','/en/about'))
          )
        )
      ))
    END AS blocks,
    CASE WHEN lower(l.tag) = 'fr' THEN 'HCIL : des compétences concrètes pour des opportunités réelles' ELSE 'HCIL: skills, people and work connected' END AS page_title,
    CASE WHEN lower(l.tag) = 'fr' THEN 'Découvrez comment HCIL aide les personnes et les organisations.' ELSE 'Discover how HCIL helps people and organizations.' END AS meta_description,
    CASE WHEN lower(l.tag) = 'fr' THEN '/' ELSE '/' END AS page_path
  FROM locale_rows l
)
INSERT INTO public.page_translations (page_id, locale_id, path, title, meta_title, meta_description, blocks, blocks_version, status, published_at)
SELECT hp.id, sb.locale_id, sb.page_path, sb.page_title, sb.page_title, sb.meta_description, sb.blocks, 2, 'published', now()
FROM home_page hp CROSS JOIN slide_blocks sb
ON CONFLICT (page_id, locale_id) DO UPDATE SET
  blocks = (
    SELECT COALESCE(jsonb_agg(value ORDER BY ordinality), '[]'::jsonb)
    FROM jsonb_array_elements(public.page_translations.blocks) WITH ORDINALITY AS blocks(value, ordinality)
    WHERE value->>'type' <> 'hero_slider'
  ) || EXCLUDED.blocks,
  blocks_version = GREATEST(public.page_translations.blocks_version, 2),
  status = 'published',
  published_at = COALESCE(public.page_translations.published_at, now()),
  updated_at = now();

COMMIT;
