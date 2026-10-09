// Home page content is a list of typed blocks: { type, props }.
// This is the same shape stored in page_translations.blocks, so moving the page to the database
// later only changes where getHomeBlocks() reads from.

export type Cta = { label: string; href: string };

export type HeroVisual = {
  illustrative: string;
  requestLabel: string;
  requestText: string;
  packagesLabel: string;
  packages: { title: string; critical?: boolean; chips: { label: string; kind: "capability" | "language" }[] }[];
  matchLabel: string;
  matchInitials: string;
  matchRole: string;
  confidenceLabel: string;
  confidence: number; // 0..1
  packageOutcomeLabel: string;
  packageOutcomeText: string;
};

export type Audience = { tag: string; title: string; items: string[]; cta: Cta };

export type HomeBlock =
  | {
      type: "hero";
      props: { eyebrow: string; title: string; subtitle: string; primary: Cta; secondary: Cta; note: string; visual: HeroVisual };
    }
  | { type: "highlights"; props: { ariaLabel: string; items: { title: string; text: string }[] } }
  | { type: "steps"; props: { id: string; title: string; subtitle: string; items: { title: string; text: string }[] } }
  | {
      type: "principles";
      props: {
        id: string;
        title: string;
        subtitle: string;
        items: { icon: "layers" | "languages" | "shield" | "coins"; title: string; text: string }[];
      };
    }
  | { type: "audiences"; props: { id: string; employers: Audience; talent: Audience } }
  | {
      type: "languages";
      props: { id: string; title: string; subtitle: string; live: string[]; liveLabel: string; soonLabel: string; soon: string[] };
    }
  | { type: "faq"; props: { id: string; title: string; items: { q: string; a: string }[] } }
  | { type: "cta"; props: { title: string; text: string; primary: Cta; secondary: Cta } };
