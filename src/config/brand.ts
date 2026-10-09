// Single source of truth for the public brand and canonical site URL.
// Keep product naming changes here rather than scattering strings across components.
export const BRAND = {
  name: "HCIL",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
