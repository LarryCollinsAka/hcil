import type { Locale } from "@/lib/i18n";
import { BRAND } from "@/config/brand";

export type SiteCopy = {
  skip: string;
  menu: string;
  primaryNav: string;
  getStarted: string;
  nav: { how: string; principles: string; audiences: string; faq: string; about: string; blog: string };
  aboutMenu: { overview: string; mission: string; intelligence: string; policy: string; trust: string };
  footer: {
    tagline: string;
    groups: { title: string; links: { label: string; href: string }[] }[];
    rights: string;
    language: string;
  };
};

const en: SiteCopy = {
  skip: "Skip to content",
  menu: "Menu",
  primaryNav: "Primary navigation",
  getStarted: "Choose your path",
  nav: { how: "How it works", principles: "Principles", audiences: "Companies & talent", faq: "FAQ", about: "About HCIL", blog: "Blog" },
  aboutMenu: { overview: "Overview", mission: "Mission & approach", intelligence: "How intelligence works", policy: "Policy alignment", trust: "Trust & governance" },
  footer: {
    tagline: "Work first. Capability, in context.",
    groups: [
      {
        title: "Explore",
        links: [
          { label: "How it works", href: "/#how" },
          { label: "Companies", href: "/#for-companies" },
          { label: "Talent", href: "/#for-talent" },
        ],
      },
      {
        title: "About HCIL",
        links: [
          { label: "Overview", href: "/about" },
          { label: "How intelligence works", href: "/about/intelligence" },
          { label: "Policy alignment", href: "/about/policy-alignment" },
          { label: "Trust & governance", href: "/about/trust" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Blog", href: "/blog" },
          { label: "Principles", href: "/#principles" },
          { label: "FAQ", href: "/#faq" },
        ],
      },
    ],
    rights: `All rights reserved.`,
    language: "Language",
  },
};

const fr: SiteCopy = {
  skip: "Aller au contenu",
  menu: "Menu",
  primaryNav: "Navigation principale",
  getStarted: "Choisir un parcours",
  nav: { how: "Comment ça marche", principles: "Principes", audiences: "Entreprises et talents", faq: "FAQ", about: "À propos de HCIL", blog: "Blog" },
  aboutMenu: { overview: "Vue d’ensemble", mission: "Mission et approche", intelligence: "Fonctionnement de l’intelligence", policy: "Cadres de référence", trust: "Confiance et gouvernance" },
  footer: {
    tagline: "Le travail d’abord. La compétence, en contexte.",
    groups: [
      {
        title: "Explorer",
        links: [
          { label: "Comment ça marche", href: "/#how" },
          { label: "Entreprises", href: "/#for-companies" },
          { label: "Talents", href: "/#for-talent" },
        ],
      },
      {
        title: "À propos de HCIL",
        links: [
          { label: "Vue d’ensemble", href: "/about" },
          { label: "Fonctionnement de l’intelligence", href: "/about/intelligence" },
          { label: "Cadres de référence", href: "/about/policy-alignment" },
          { label: "Confiance et gouvernance", href: "/about/trust" },
        ],
      },
      {
        title: "Ressources",
        links: [
          { label: "Blog", href: "/blog" },
          { label: "Principes", href: "/#principles" },
          { label: "FAQ", href: "/#faq" },
        ],
      },
    ],
    rights: `Tous droits réservés.`,
    language: "Langue",
  },
};

const COPY: Record<Locale, SiteCopy> = { en, fr };

export function getSiteCopy(locale: Locale): SiteCopy {
  return COPY[locale];
}

export function metaFor(locale: Locale): { title: string; description: string } {
  return locale === "fr"
    ? {
        title: `${BRAND.name} : recrutez pour le travail, pas pour l’intitulé du poste`,
        description:
          "Décrivez le résultat recherché. HCIL structure le travail en lots clairs, relie les compétences aux preuves et conçoit un paiement lié à l’acceptation de chaque lot attribué.",
      }
    : {
        title: `${BRAND.name}: hire for the work, not the job title`,
        description:
          "Describe the outcome you need. HCIL structures work into clear packages, connects capabilities to evidence, and is designed to link each contributor’s payout to acceptance of their assigned package.",
      };
}
