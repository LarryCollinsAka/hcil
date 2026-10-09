import type { Locale } from "@/lib/i18n";
import { BRAND } from "@/config/brand";

export type SiteCopy = {
  skip: string;
  menu: string;
  signIn: string;
  getStarted: string;
  nav: { how: string; principles: string; audiences: string; faq: string };
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
  signIn: "Sign in",
  getStarted: "Get started",
  nav: { how: "How it works", principles: "Principles", audiences: "Companies & talent", faq: "FAQ" },
  footer: {
    tagline: "Work first. Capability, in context.",
    groups: [
      {
        title: "Product",
        links: [
          { label: "How it works", href: "#how" },
          { label: "Principles", href: "#principles" },
          { label: "FAQ", href: "#faq" },
        ],
      },
      {
        title: "Community",
        links: [
          { label: "Blog", href: "/blog" },
          { label: "Forum", href: "/forum" },
          { label: "About", href: "/about" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
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
  signIn: "Connexion",
  getStarted: "Commencer",
  nav: { how: "Comment ça marche", principles: "Principes", audiences: "Entreprises et talents", faq: "FAQ" },
  footer: {
    tagline: "Le travail d’abord. La compétence, en contexte.",
    groups: [
      {
        title: "Produit",
        links: [
          { label: "Comment ça marche", href: "#how" },
          { label: "Principes", href: "#principles" },
          { label: "FAQ", href: "#faq" },
        ],
      },
      {
        title: "Communauté",
        links: [
          { label: "Blog", href: "/blog" },
          { label: "Forum", href: "/forum" },
          { label: "À propos", href: "/about" },
        ],
      },
      {
        title: "Légal",
        links: [
          { label: "Confidentialité", href: "/privacy" },
          { label: "Conditions d’utilisation", href: "/terms" },
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
          "Décrivez le problème à résoudre. Nous le transformons en lots de travail clairs, associons les personnes selon leurs compétences et leurs langues, et payons à chaque jalon accepté.",
      }
    : {
        title: `${BRAND.name}: hire for the work, not the job title`,
        description:
          "Describe the problem you need solved. We turn it into clear work packages, match people on the capabilities and languages the work needs, and pay on accepted milestones.",
      };
}
