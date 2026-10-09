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
          "Describe the problem you need solved. We turn it into clear work packages, match people on the capabilities and languages the work really needs, and release payment as milestones are accepted.",
        primary: { label: "Hire for a project", href: href(l, "/get-started?as=employer") },
        secondary: { label: "Find work", href: href(l, "/get-started?as=talent") },
        note: "Early access · English & Français · Built mobile-first",
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
          milestoneLabel: "Milestone",
          milestoneText: "Accepted · XAF 250,000 released",
        },
      },
    },
    {
      type: "highlights",
      props: {
        items: [
          { value: "0", label: "universal talent scores" },
          { value: "4", label: "language skills assessed separately: read, write, listen, speak" },
          { value: "5", label: "capability levels, each backed by evidence" },
          { value: "XAF", label: "budgets and payouts in local currency" },
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
            text: "Commit a budget per milestone. Workers submit, you accept or request a revision, and payment follows acceptance.",
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
            text: "Every level traces back to an assessment or accepted work. Skills people only claim are shown as unverified.",
          },
          {
            icon: "coins",
            title: "Paid for outcomes",
            text: "Budgets are committed per milestone and payment follows accepted deliverables, so nobody waits on a teammate.",
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
            "Pay when you accept the work",
          ],
          cta: { label: "Post your first project", href: href(l, "/get-started?as=employer") },
        },
        talent: {
          tag: "For talent",
          title: "Show what you can really do.",
          items: [
            "Take assessments in the language you work best in",
            "Build a record of verified capabilities, skill by skill",
            "Get matched to work that fits, remote or on-site",
            "Earn on every accepted milestone",
          ],
          cta: { label: "Create your profile", href: href(l, "/get-started?as=talent") },
        },
      },
    },
    {
      type: "languages",
      props: {
        title: "Made for a multilingual market",
        subtitle: "English and French today, with more African languages planned.",
        live: ["English", "Français"],
        soonLabel: "Coming next",
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
            a: "Through assessments and accepted work. Each capability has a level and a confidence that grows with evidence. Skills people only claim are marked unverified.",
          },
          {
            q: "Do I need a degree to get work?",
            a: "No. We look at what you can demonstrate for the work in question, not at job titles or diplomas alone.",
          },
          {
            q: "Which languages are supported?",
            a: "English and French today. Reading, writing, listening and speaking are assessed separately, and more languages are planned.",
          },
          {
            q: "How does pricing work?",
            a: "You agree a budget per milestone before work starts. Payment follows accepted deliverables.",
          },
          {
            q: "Is it live yet?",
            a: "We’re in early access. Join the list and we’ll invite you as capacity opens up.",
          },
        ],
      },
    },
    {
      type: "cta",
      props: {
        title: "Have work that needs doing?",
        text: "Tell us the outcome. We’ll help you turn it into work people can deliver.",
        primary: { label: "Hire for a project", href: href(l, "/get-started?as=employer") },
        secondary: { label: "Find work", href: href(l, "/get-started?as=talent") },
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
        eyebrow: "La plateforme de talents centrée sur le travail, du Cameroun au monde",
        title: "Recrutez pour le travail, pas pour l’intitulé du poste.",
        subtitle:
          "Décrivez le problème à résoudre. Nous le transformons en lots de travail clairs, associons les personnes selon les compétences et les langues réellement nécessaires, et déclenchons le paiement à chaque jalon accepté.",
        primary: { label: "Lancer un projet", href: href(l, "/get-started?as=employer") },
        secondary: { label: "Trouver du travail", href: href(l, "/get-started?as=talent") },
        note: "Accès anticipé · English & Français · Pensé pour le mobile",
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
          milestoneLabel: "Jalon",
          milestoneText: "Accepté · 250 000 XAF versés",
        },
      },
    },
    {
      type: "highlights",
      props: {
        items: [
          { value: "0", label: "score de talent universel" },
          { value: "4", label: "compétences linguistiques évaluées séparément : lire, écrire, écouter, parler" },
          { value: "5", label: "niveaux de compétence, chacun appuyé par des preuves" },
          { value: "XAF", label: "budgets et paiements en monnaie locale" },
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
            text: "Engagez un budget par jalon. Les travailleurs livrent, vous acceptez ou demandez une révision, et le paiement suit l’acceptation.",
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
            text: "Chaque niveau remonte à une évaluation ou à un travail accepté. Les compétences simplement déclarées sont signalées comme non vérifiées.",
          },
          {
            icon: "coins",
            title: "Payé pour les résultats",
            text: "Les budgets sont engagés par jalon et le paiement suit les livrables acceptés : personne n’attend un coéquipier.",
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
            "Payez quand vous acceptez le travail",
          ],
          cta: { label: "Publier votre premier projet", href: href(l, "/get-started?as=employer") },
        },
        talent: {
          tag: "Pour les talents",
          title: "Montrez ce que vous savez vraiment faire.",
          items: [
            "Passez les évaluations dans la langue où vous êtes le plus à l’aise",
            "Constituez un dossier de compétences vérifiées, une par une",
            "Soyez associé à du travail adapté, à distance ou sur site",
            "Gagnez à chaque jalon accepté",
          ],
          cta: { label: "Créer mon profil", href: href(l, "/get-started?as=talent") },
        },
      },
    },
    {
      type: "languages",
      props: {
        title: "Pensé pour un marché multilingue",
        subtitle: "Anglais et français aujourd’hui, d’autres langues africaines à venir.",
        live: ["Français", "English"],
        soonLabel: "Prochainement",
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
            a: "Par des évaluations et du travail accepté. Chaque compétence a un niveau et un indice de confiance qui augmente avec les preuves. Les compétences simplement déclarées sont marquées comme non vérifiées.",
          },
          {
            q: "Faut-il un diplôme pour trouver du travail ?",
            a: "Non. Nous regardons ce que vous pouvez démontrer pour le travail concerné, pas uniquement les intitulés de poste ou les diplômes.",
          },
          {
            q: "Quelles langues sont prises en charge ?",
            a: "L’anglais et le français aujourd’hui. La lecture, l’écriture, l’écoute et l’expression orale sont évaluées séparément, et d’autres langues sont prévues.",
          },
          {
            q: "Comment fonctionne la tarification ?",
            a: "Vous convenez d’un budget par jalon avant le début du travail. Le paiement suit les livrables acceptés.",
          },
          {
            q: "Est-ce déjà disponible ?",
            a: "Nous sommes en accès anticipé. Inscrivez-vous et nous vous inviterons à mesure que la capacité augmente.",
          },
        ],
      },
    },
    {
      type: "cta",
      props: {
        title: "Du travail à faire aboutir ?",
        text: "Dites-nous le résultat attendu. Nous vous aidons à le transformer en travail que des personnes peuvent livrer.",
        primary: { label: "Lancer un projet", href: href(l, "/get-started?as=employer") },
        secondary: { label: "Trouver du travail", href: href(l, "/get-started?as=talent") },
      },
    },
  ];
}

// Async on purpose: the database version will be async too.
export async function getHomeBlocks(locale: Locale): Promise<HomeBlock[]> {
  return locale === "fr" ? fr() : en();
}
