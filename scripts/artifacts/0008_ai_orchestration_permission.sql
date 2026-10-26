-- HCIL AI orchestration permission seed.
-- This creates the permission only. It intentionally does not grant it to any role.
-- After review, grant it to the intended platform role using access_role_permissions.

INSERT INTO public.access_permissions (permission_key, resource, action, description)
VALUES (
  'ai.orchestration.use',
  'ai_orchestration',
  'use',
  'Submit approved tasks to the HCIL AI orchestration layer'
)
ON CONFLICT (permission_key) DO NOTHING;
