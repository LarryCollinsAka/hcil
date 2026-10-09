import { type Locale, href } from "@/lib/i18n";
import type { HomeBlock } from "./types";

// DRAFT COPY. Edit freely, but keep claims to what the product will really do.
// The blocks use the same { type, props } shape as page_translations.blocks, so this file can be
// replaced by a database read without touching any component.

function en(): HomeBlock[] {
  const l: Locale = "en";
  return [
    {
      type: "hero",
      props: {
        eyebrow: "Work-first talent platform for Cameroon and beyond",
        title: "Hire for the work, not the job title.",
        subtitle:
          "Describe the outcome you need. HCIL is being designed to structure it into clear work packages, connect requirements to demonstrated capabilities, and release each contributor’s agreed payout when their own package is accepted.",
        primary: { label: "I’m hiring", href: href(l, "#for-companies") },
        secondary: { label: "I’m looking for work", href: href(l, "#for-talent") },
        note: "Early-access preview · Homepage in English and French · Core workflows are in development",
        visual: {
          illustrative: "Illustrative example",
          requestLabel: "Your request",
          requestText: "“Our sales data is a mess. We need it cleaned, analysed and summarised for a French-speaking client.”",
          packagesLabel: "Structured into work",
          packages: [
            { title: "Clean the dataset", critical: true, chips: [{ label: "Data cleaning · Level 3", kind: "capability" }] },
            { title: "Pivot analysis", chips: [{ label: "Excel pivots · Level 3", kind: "capability" }] },
            {
              title: "Client summary",
              critical: true,
              chips: [
                { label: "Business reporting · Level 2", kind: "capability" },
                { label: "French writing · C1", kind: "language" },
              ],
            },
          ],
          matchLabel: "Best fit for “Client summary”",
          matchInitials: "MN",
          matchRole: "Business analyst · Yaoundé",
          confidenceLabel: "Evidence confidence",
          confidence: 0.82,
          packageOutcomeLabel: "Package outcome",
          packageOutcomeText: "Accepted · payout follows this package’s agreement",
        },
      },
    },
    {
      type: "highlights",
      props: {
        ariaLabel: "HCIL product commitments",
        items: [
          { title: "Outcome-first", text: "Start with the business result, not a job title." },
          { title: "Evidence-backed", text: "Connect capability claims to relevant evidence." },
          { title: "Composable teams", text: "Combine complementary capabilities when needed." },
          { title: "Package-level payout", text: "Milestones group work; each contributor’s payout follows acceptance of their own package." },
        ],
      },
    },
    {
      type: "steps",
      props: {
        id: "how",
        title: "From problem to proof in five steps",
        subtitle: "Every project follows the same path, and every step leaves evidence behind.",
        items: [
          { title: "Describe the outcome", text: "Tell us what you need in your own words, in English or French. No job title required." },
          {
            title: "Structure the work",
            text: "AI-assisted breakdown into work packages with acceptance criteria. Nothing moves until you confirm it.",
          },
          {
            title: "Match on capability",
            text: "People are matched package by package on the capabilities and languages the work actually requires.",
          },
          {
            title: "Fund, deliver, accept",
            text: "Fund a milestone before work starts. Review each submission against its package criteria; the intended payout trigger is acceptance of that contributor’s assigned package.",
          },
          {
            title: "Build proof",
            text: "Accepted work becomes verifiable evidence that strengthens the worker’s capability record.",
          },
        ],
      },
    },
    {
      type: "principles",
      props: {
        id: "principles",
        title: "Built differently, on purpose",
        subtitle: "Most platforms rank people. We describe what each person can demonstrate, and for which work.",
        items: [
          {
            icon: "layers",
            title: "No universal talent score",
            text: "Capability is recorded skill by skill, with a level and a confidence. We never collapse a person into one number.",
          },
          {
            icon: "languages",
            title: "Languages, by modality",
            text: "Reading, writing, listening and speaking are assessed separately, because a translator and a call-centre agent need different things.",
          },
          {
            icon: "shield",
            title: "Proof over claims",
            text: "When a capability is marked verified, its record is intended to link back to an assessment or accepted work. Self-reported skills remain distinct from verified evidence.",
          },
          {
            icon: "coins",
            title: "Paid for outcomes",
            text: "Milestones group packages; each contributor’s agreed payout is designed to follow acceptance of their own package, not a teammate’s progress.",
          },
        ],
      },
    },
    {
      type: "audiences",
      props: {
        id: "audiences",
        employers: {
          tag: "For companies",
          title: "Get the outcome, not a pile of CVs.",
          items: [
            "Describe the problem; we structure it with you",
            "Staff each package with the right capabilities and languages",
            "Assemble micro-teams when one person can’t cover it all",
            "Each package has explicit acceptance criteria",
          ],
          cta: { label: "See how projects work", href: href(l, "#how") },
        },
        talent: {
          tag: "For talent",
          title: "Show what you can really do.",
          items: [
            "Take assessments in the language you work best in",
            "Build a record of verified capabilities, skill by skill",
            "Get matched to work that fits, remote or on-site",
            "Your agreed payout follows acceptance of your assigned package",
          ],
          cta: { label: "How capability is verified", href: href(l, "#principles") },
        },
      },
    },
    {
      type: "languages",
      props: {
        id: "languages",
        title: "Made for a multilingual market",
        subtitle: "The homepage is available in English and French. Wider language support is planned feature by feature.",
        liveLabel: "Homepage languages",
        live: ["English", "Français"],
        soonLabel: "Languages being considered for future support",
        soon: ["Pidgin", "Ewondo", "Fulfulde", "Wolof", "Swahili", "Hausa", "Arabic"],
      },
    },
    {
      type: "faq",
      props: {
        id: "faq",
        title: "Questions, answered",
        items: [
          {
            q: "How are people verified?",
            a: "The intended model uses assessments and accepted work as evidence. Self-reported skills will remain distinct from verified capability records.",
          },
          {
            q: "Do I need a degree to get work?",
            a: "No. We look at what you can demonstrate for the work in question, not at job titles or diplomas alone.",
          },
          {
            q: "Which languages are supported?",
            a: "The homepage is available in English and French. Broader language support for platform features is planned and will be introduced feature by feature.",
          },
          {
            q: "How does pricing work?",
            a: "The intended model funds work by milestone, while each contributor’s agreed payout follows acceptance of their own assigned package. Payment processing is not live in this early-access preview.",
          },
          {
            q: "Is it live yet?",
            a: "This is an early-access preview. Work intake, matching, contracts and payment are still being built; the examples on this page are illustrative, not live transactions.",
          },
        ],
      },
    },
    {
      type: "cta",
      props: {
        title: "Have work that needs doing?",
        text: "HCIL is in development. Explore the intended paths for organizations and talent while the first work-delivery features are being built.",
        primary: { label: "I’m hiring", href: href(l, "#for-companies") },
        secondary: { label: "I’m looking for work", href: href(l, "#for-talent") },
      },
    },
  ];
}

function fr(): HomeBlock[] {
  const l: Locale = "fr";
  return [
    {
      type: "hero",
      props: {
        eyebrow: "Une plateforme centrée sur le travail, du Cameroun au monde",
        title: "Recrutez pour le travail, pas pour l’intitulé du poste.",
        subtitle:
          "Décrivez le résultat recherché. HCIL est conçu pour le structurer en lots de travail clairs, relier les exigences aux compétences démontrées et déclencher le paiement convenu de chaque contributeur lorsque son propre lot est accepté.",
        primary: { label: "Je recrute", href: href(l, "#for-companies") },
        secondary: { label: "Je cherche du travail", href: href(l, "#for-talent") },
        note: "Aperçu en accès anticipé · Site en français et en anglais · Les fonctionnalités principales sont en développement",
        visual: {
          illustrative: "Exemple illustratif",
          requestLabel: "Votre demande",
          requestText: "« Nos données de ventes sont en désordre. Il faut les nettoyer, les analyser et en faire une synthèse pour un client francophone. »",
          packagesLabel: "Structuré en lots de travail",
          packages: [
            { title: "Nettoyer le jeu de données", critical: true, chips: [{ label: "Nettoyage de données · Niveau 3", kind: "capability" }] },
            { title: "Analyse en tableaux croisés", chips: [{ label: "Tableaux croisés Excel · Niveau 3", kind: "capability" }] },
            {
              title: "Synthèse client",
              critical: true,
              chips: [
                { label: "Reporting d’entreprise · Niveau 2", kind: "capability" },
                { label: "Rédaction en français · C1", kind: "language" },
              ],
            },
          ],
          matchLabel: "Meilleur profil pour « Synthèse client »",
          matchInitials: "MN",
          matchRole: "Analyste d’affaires · Yaoundé",
          confidenceLabel: "Confiance dans les preuves",
          confidence: 0.82,
          packageOutcomeLabel: "Résultat du lot",
          packageOutcomeText: "Accepté · paiement selon l’accord de ce lot",
        },
      },
    },
    {
      type: "highlights",
      props: {
        ariaLabel: "Les engagements de HCIL",
        items: [
          { title: "Résultat d’abord", text: "Partir du résultat attendu, pas d’un intitulé de poste." },
          { title: "Fondé sur des preuves", text: "Relier les compétences déclarées aux preuves pertinentes." },
          { title: "Équipes modulaires", text: "Combiner des compétences complémentaires lorsque nécessaire." },
          { title: "Paiement par lot", text: "Les jalons regroupent le travail ; chaque contributeur est payé selon l’acceptation de son propre lot." },
        ],
      },
    },
    {
      type: "steps",
      props: {
        id: "how",
        title: "Du problème à la preuve en cinq étapes",
        subtitle: "Chaque projet suit le même chemin, et chaque étape laisse des preuves.",
        items: [
          {
            title: "Décrivez le résultat",
            text: "Dites ce dont vous avez besoin avec vos propres mots, en français ou en anglais. Pas besoin d’intitulé de poste.",
          },
          {
            title: "Structurez le travail",
            text: "Découpage assisté par IA en lots de travail avec critères d’acceptation. Rien n’avance sans votre confirmation.",
          },
          {
            title: "Associez par compétence",
            text: "Les personnes sont associées lot par lot, selon les compétences et les langues que le travail exige vraiment.",
          },
          {
            title: "Financez, livrez, acceptez",
            text: "Financez un jalon avant le début du travail. Évaluez chaque livraison selon les critères de son lot ; le paiement prévu est déclenché par l’acceptation du lot attribué à chaque contributeur.",
          },
          {
            title: "Construisez la preuve",
            text: "Le travail accepté devient une preuve vérifiable qui renforce le dossier de compétences.",
          },
        ],
      },
    },
    {
      type: "principles",
      props: {
        id: "principles",
        title: "Conçu autrement, volontairement",
        subtitle: "La plupart des plateformes classent les gens. Nous décrivons ce que chaque personne peut démontrer, et pour quel travail.",
        items: [
          {
            icon: "layers",
            title: "Aucun score de talent universel",
            text: "Les compétences sont enregistrées une par une, avec un niveau et un indice de confiance. Nous ne réduisons jamais une personne à un seul chiffre.",
          },
          {
            icon: "languages",
            title: "Les langues, par modalité",
            text: "Lecture, écriture, écoute et expression orale sont évaluées séparément, car un traducteur et un conseiller de centre d’appels n’ont pas les mêmes besoins.",
          },
          {
            icon: "shield",
            title: "Des preuves, pas des promesses",
            text: "Lorsqu’une compétence est marquée comme vérifiée, son dossier doit renvoyer à une évaluation ou à un travail accepté. Les compétences simplement déclarées restent distinctes des preuves vérifiées.",
          },
          {
            icon: "coins",
            title: "Payé pour les résultats",
            text: "Les jalons regroupent les lots ; le paiement convenu de chaque contributeur doit suivre l’acceptation de son propre lot, sans dépendre de l’avancement d’un coéquipier.",
          },
        ],
      },
    },
    {
      type: "audiences",
      props: {
        id: "audiences",
        employers: {
          tag: "Pour les entreprises",
          title: "Obtenez le résultat, pas une pile de CV.",
          items: [
            "Décrivez le problème ; nous le structurons avec vous",
            "Affectez chaque lot aux bonnes compétences et langues",
            "Formez des micro-équipes quand une seule personne ne suffit pas",
            "Chaque lot possède ses propres critères d’acceptation",
          ],
          cta: { label: "Voir le déroulement d’un projet", href: href(l, "#how") },
        },
        talent: {
          tag: "Pour les talents",
          title: "Montrez ce que vous savez vraiment faire.",
          items: [
            "Passez les évaluations dans la langue où vous êtes le plus à l’aise",
            "Constituez un dossier de compétences vérifiées, une par une",
            "Soyez associé à du travail adapté, à distance ou sur site",
            "Votre paiement convenu suit l’acceptation de votre lot attribué",
          ],
          cta: { label: "Comment les compétences sont vérifiées", href: href(l, "#principles") },
        },
      },
    },
    {
      type: "languages",
      props: {
        id: "languages",
        title: "Pensé pour un marché multilingue",
        subtitle: "Le site est disponible en français et en anglais. La prise en charge d’autres langues sera développée fonctionnalité par fonctionnalité.",
        liveLabel: "Langues du site",
        live: ["Français", "English"],
        soonLabel: "Langues envisagées pour une prise en charge future",
        soon: ["Pidgin", "Ewondo", "Fulfulde", "Wolof", "Swahili", "Haoussa", "Arabe"],
      },
    },
    {
      type: "faq",
      props: {
        id: "faq",
        title: "Vos questions, nos réponses",
        items: [
          {
            q: "Comment les personnes sont-elles vérifiées ?",
            a: "Le modèle prévu s’appuie sur des évaluations et des travaux acceptés. Les compétences simplement déclarées resteront distinctes des dossiers de compétences vérifiées.",
          },
          {
            q: "Faut-il un diplôme pour trouver du travail ?",
            a: "Non. Nous regardons ce que vous pouvez démontrer pour le travail concerné, pas uniquement les intitulés de poste ou les diplômes.",
          },
          {
            q: "Quelles langues sont prises en charge ?",
            a: "Le site est disponible en français et en anglais. La prise en charge linguistique des fonctionnalités sera élargie progressivement, fonctionnalité par fonctionnalité.",
          },
          {
            q: "Comment fonctionne la tarification ?",
            a: "Le modèle prévu finance le travail par jalon, tandis que le paiement convenu de chaque contributeur suit l’acceptation de son propre lot. Le traitement des paiements n’est pas encore actif dans cet aperçu en accès anticipé.",
          },
          {
            q: "Est-ce déjà disponible ?",
            a: "Ce site est un aperçu en accès anticipé. La saisie des besoins, l’association, les contrats et les paiements sont encore en développement ; les exemples de cette page sont illustratifs et ne correspondent pas à des transactions réelles.",
          },
        ],
      },
    },
    {
      type: "cta",
      props: {
        title: "Du travail à faire aboutir ?",
        text: "HCIL est en développement. Découvrez les parcours prévus pour les entreprises et les talents pendant la construction des premières fonctionnalités de livraison du travail.",
        primary: { label: "Je recrute", href: href(l, "#for-companies") },
        secondary: { label: "Je cherche du travail", href: href(l, "#for-talent") },
      },
    },
  ];
}

// Async on purpose: the database version will be async too.
export async function getHomeBlocks(locale: Locale): Promise<HomeBlock[]> {
  return locale === "fr" ? fr() : en();
}
