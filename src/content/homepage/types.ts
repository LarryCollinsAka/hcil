/**
 * Homepage content contract.
 * Keep this JSON-serializable and compatible with page_translations.blocks:
 * every block is { type, props }. Use this union to validate local fixtures
 * now and database-provided blocks later.
 */
export type HomepageLocale = "en" | "fr";

export interface NavItem {
  label: string;
  href: string;
}

export interface WorkUnitContent {
  number: string;
  title: string;
  capability: string;
  amount: string;
  tone: "green" | "red" | "yellow";
}

export type HomepageBlock =
  | {
      type: "announcement";
      props: { message: string; linkLabel: string; linkHref: string };
    }
  | {
      type: "navigation";
      props: {
        links: NavItem[];
        loginLabel: string;
        startLabel: string;
        homeLabel: string;
        talentLabel: string;
        organizationLabel: string;
        localeLabel: string;
      };
    }
  | {
      type: "hero";
      props: {
        eyebrow: string;
        titleBefore: string;
        titleAccent: string;
        description: string;
        talentCta: string;
        organizationCta: string;
        proofTitle: string;
        proofBody: string;
        previewAriaLabel: string;
        previewLabel: string;
        categoryLabel: string;
        workTitle: string;
        workDescription: string;
        timelineLabel: string;
        timelineValue: string;
        packagesLabel: string;
        packagesValue: string;
        teamLabel: string;
        teamValue: string;
        breakdownLabel: string;
        budgetLabel: string;
        workUnits: WorkUnitContent[];
        footerNote: string;
        floatingTitle: string;
        floatingBody: string;
        floatingSecondTitle: string;
        floatingSecondBody: string;
        caption: string;
      };
    }
  | {
      type: "principles";
      props: {
        ariaLabel: string;
        intro: string;
        items: Array<{ number: string; label: string }>;
      };
    }
  | {
      type: "work_model";
      props: {
        eyebrow: string;
        titleBefore: string;
        titleAccent: string;
        description: string;
        steps: Array<{
          index: string;
          title: string;
          description: string;
          graphic: "define" | "verify" | "deliver";
          tags?: [string, string, string];
        }>;
      };
    }
  | {
      type: "audience_panels";
      props: {
        talent: {
          eyebrow: string;
          titleBefore: string;
          titleAccent: string;
          description: string;
          benefits: string[];
          cta: string;
        };
        organization: {
          eyebrow: string;
          titleBefore: string;
          titleAccent: string;
          description: string;
          benefits: string[];
          cta: string;
        };
      };
    }
  | {
      type: "capability_passport";
      props: {
        eyebrow: string;
        titleBefore: string;
        titleAccent: string;
        description: string;
        tags: string[];
        cta: string;
        passportLabel: string;
        evidenceLabel: string;
        sampleLabel: string;
        sampleName: string;
        sampleRole: string;
        capabilityColumn: string;
        levelColumn: string;
        skills: Array<{ name: string; evidence: string; level: string; tone: "advanced" | "proficient" | "building" }>;
        permissionNote: string;
        disclaimer: string;
      };
    }
  | {
      type: "closing_cta";
      props: {
        eyebrow: string;
        titleBefore: string;
        titleAccent: string;
        description: string;
        talentCta: string;
        organizationCta: string;
      };
    }
  | {
      type: "footer";
      props: { tagline: string; links: NavItem[]; copyrightBrand: string };
    };

export interface HomepageDocument {
  locale: HomepageLocale;
  blocks: HomepageBlock[];
}
