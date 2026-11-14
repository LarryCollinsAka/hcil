import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { pages, pageTranslations, platformLocales } from "@/db/schema";
import { type Locale, href } from "@/lib/i18n";
import type { HomeBlock, HeroSlide } from "./types";

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
          { title: "Start with the result", text: "Start with the business result, not a job title." },
          { title: "Supported by proof", text: "Support skills with relevant examples and assessments." },
          { title: "Build the right team", text: "Combine complementary capabilities when needed." },
          { title: "Clear agreements for each task", text: "Milestones group work; each contributor’s payout follows acceptance of their own package." },
        ],
      },
    },
    {
      type: "steps",
      props: {
        id: "how",
        title: "From a real need to work people can show",
        subtitle: "A clear process helps everyone understand what needs to happen, who is doing it and what has been completed.",
        items: [
          { title: "Describe the outcome", text: "Tell us what you need in your own words, in English or French. No job title required." },
          {
            title: "Structure the work",
            text: "AI can help organize the work into clear tasks and expected results. You review and approve the plan before anything moves forward.",
          },
          {
            title: "Find people with the right skills",
            text: "People are considered for the skills and languages that the work actually needs.",
          },
          {
            title: "Fund, deliver, accept",
            text: "Fund a milestone before work starts. Review each submission against its package criteria; the intended payout trigger is acceptance of that contributor’s assigned package.",
          },
          {
            title: "Show what you have done",
            text: "Completed work can help people build a stronger record of what they know and can do.",
          },
        ],
      },
    },
    {
      type: "intelligence",
      props: {
        id: "intelligence",
        eyebrow: "A clearer picture of people, skills and work",
        title: "AI that helps people and organizations make better decisions about work.",
        subtitle: "A business is more than a list of job titles. HCIL is being built to help understand the people, skills, goals and activities involved, so organizations can make better-informed decisions.",
        layers: [
          { tag: "Reliable information", title: "One trusted record", text: "Keeps important information about organizations, projects, skills, approvals and commitments in one place." },
          { tag: "How things connect", title: "Connected information", text: "Shows how people, teams, projects, skills and results relate to one another." },
          { tag: "Smarter search", title: "Search by meaning", text: "Helps find useful information even when people describe the same thing in different words." },
          { tag: "Planning support", title: "AI assistant", text: "Uses information people are allowed to access to help clarify needs, suggest next steps and support coordination." },
        ],
        flowTitle: "How the AI is intended to help",
        flow: ["Understand the organization’s needs", "Connect the work to relevant skills", "Suggest useful next steps", "Learn from completed work"],
        statusNote: "This is the direction HCIL is being built toward. Some features are still in development. Important decisions will remain subject to clear rules, permissions and human approval.",
        link: { label: "Explore how HCIL intelligence works", href: href(l, "/about/intelligence") },
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
            title: "Language skills that matter for the work",
            text: "Reading, writing, listening and speaking are assessed separately, because a translator and a call-centre agent need different things.",
          },
          {
            icon: "shield",
            title: "Proof over claims",
            text: "When a skill is marked as verified, it should be supported by an assessment or completed work. Skills people report themselves remain clearly identified.",
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
            "Find people with the right skills and languages for each task",
            "Bring together a small team when one person is not enough",
            "Everyone knows what a completed task should look like",
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
            "Clear expectations about how your contribution is recognized",
          ],
          cta: { label: "How skills are checked", href: href(l, "#principles") },
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
      type: "journal",
      props: {
        id: "journal",
        eyebrow: "From the HCIL journal",
        title: "Ideas for a better way to work.",
        subtitle: "Notes on capability-in-context, work design and the intelligence behind HCIL. These sample articles are editorial previews.",
        items: [
          { slug: "capability-in-context", href: href(l, "/blog/capability-in-context"), category: "HCIL principles", title: "Why capability needs context", excerpt: "A skill label alone cannot tell us whether someone can deliver a particular outcome under specific conditions." },
          { slug: "a-knowledge-graph-for-organizations", href: href(l, "/blog/a-knowledge-graph-for-organizations"), category: "AI architecture", title: "Why organizations need a knowledge graph", excerpt: "Semantic search finds related information; a graph helps connect the people, decisions, projects and evidence." },
          { slug: "snd30-and-human-capital", href: href(l, "/blog/snd30-and-human-capital"), category: "Development context", title: "HCIL and Cameroon’s development priorities", excerpt: "Explore a potential contribution to human-capital and employment goals without overstating impact." },
        ],
        link: { label: "Read all articles", href: href(l, "/blog") },
        readLabel: "Read article",
        previewNote: "Editorial preview: sample articles; review sources before official publication.",
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
            a: "The planned approach is to agree on payment for each person’s contribution and connect it to the work they complete. Payment processing is not available in this early-access preview.",
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
          { title: "Appuyé par des preuves", text: "Appuyer les compétences par des exemples et des évaluations utiles." },
          { title: "Équipes modulaires", text: "Combiner des compétences complémentaires lorsque nécessaire." },
          { title: "Des accords clairs pour chaque tâche", text: "Les jalons regroupent le travail ; chaque contributeur est payé selon l’acceptation de son propre lot." },
        ],
      },
    },
    {
      type: "steps",
      props: {
        id: "how",
        title: "D’un besoin concret à un travail bien réalisé",
        subtitle: "Un parcours clair permet à chacun de comprendre le travail à faire, les responsabilités et les résultats obtenus.",
        items: [
          {
            title: "Décrivez le résultat",
            text: "Dites ce dont vous avez besoin avec vos propres mots, en français ou en anglais. Pas besoin d’intitulé de poste.",
          },
          {
            title: "Structurez le travail",
            text: "L’IA peut aider à organiser le travail en tâches claires et en résultats attendus. Vous examinez et validez le plan avant la suite.",
          },
          {
            title: "Trouvez les personnes qui ont les bonnes compétences",
            text: "Les personnes sont proposées selon les compétences et les langues réellement nécessaires au travail.",
          },
          {
            title: "Financez, livrez, acceptez",
            text: "Financez un jalon avant le début du travail. Évaluez chaque livraison selon les critères de son lot ; le paiement prévu est déclenché par l’acceptation du lot attribué à chaque contributeur.",
          },
          {
            title: "Montrez ce que vous avez réalisé",
            text: "Le travail réalisé peut aider chacun à mieux démontrer ses connaissances et ses compétences.",
          },
        ],
      },
    },
    {
      type: "intelligence",
      props: {
        id: "intelligence",
        eyebrow: "Mieux comprendre les personnes, les compétences et le travail",
        title: "Une IA qui aide les personnes et les organisations à mieux décider.",
        subtitle: "Une organisation ne se résume pas à une liste de postes. HCIL est conçu pour mieux comprendre les personnes, les compétences, les objectifs et les activités afin d’aider à prendre de meilleures décisions.",
        layers: [
          { tag: "Informations fiables", title: "One trusted record", text: "Rassemble les informations importantes sur les organisations, les projets, les compétences, les validations et les engagements." },
          { tag: "Les liens entre les informations", title: "Informations reliées", text: "Montre les liens entre les personnes, les équipes, les projets, les compétences et les résultats." },
          { tag: "Recherche intelligente", title: "Recherche par le sens", text: "Aide à retrouver les bonnes informations même lorsque les mots utilisés sont différents." },
          { tag: "Aide à la planification", title: "Assistant IA", text: "Utilise les informations autorisées pour clarifier les besoins, suggérer les prochaines étapes et faciliter la coordination." },
        ],
        flowTitle: "Comment l’IA devrait vous aider",
        flow: ["Comprendre les besoins de l’organisation", "Relier le travail aux compétences utiles", "Suggérer les prochaines étapes", "Tirer des enseignements du travail réalisé"],
        statusNote: "Cette approche guide le développement de HCIL. Certaines fonctionnalités sont encore en préparation. Les décisions importantes resteront soumises à des règles claires, aux autorisations nécessaires et à une validation humaine.",
        link: { label: "Comprendre l’intelligence HCIL", href: href(l, "/about/intelligence") },
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
            title: "Les compétences linguistiques utiles au travail",
            text: "Lecture, écriture, écoute et expression orale sont évaluées séparément, car un traducteur et un conseiller de centre d’appels n’ont pas les mêmes besoins.",
          },
          {
            icon: "shield",
            title: "Des preuves, pas des promesses",
            text: "Lorsqu’une compétence est dite vérifiée, elle doit être appuyée par une évaluation ou un travail réalisé. Les compétences déclarées par les personnes restent clairement identifiées.",
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
            "Trouvez les compétences et les langues adaptées à chaque tâche",
            "Réunissez une petite équipe quand une seule personne ne suffit pas",
            "Chacun sait à quoi ressemble un travail terminé",
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
            "Les attentes concernant votre contribution sont clairement définies",
          ],
          cta: { label: "Comment les compétences sont évaluées", href: href(l, "#principles") },
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
      type: "journal",
      props: {
        id: "journal",
        eyebrow: "Le journal HCIL",
        title: "Des idées pour mieux organiser le travail.",
        subtitle: "Des notes sur les compétences en contexte, l’organisation du travail et l’intelligence qui sous-tend HCIL. Ces articles sont des aperçus éditoriaux.",
        items: [
          { slug: "capability-in-context", href: href(l, "/blog/capability-in-context"), category: "Principes HCIL", title: "Pourquoi une compétence doit être comprise en contexte", excerpt: "Une étiquette de compétence ne suffit pas à prouver qu’une personne peut livrer un résultat dans des conditions précises." },
          { slug: "a-knowledge-graph-for-organizations", href: href(l, "/blog/a-knowledge-graph-for-organizations"), category: "Architecture IA", title: "Pourquoi les organisations ont besoin d’un graphe", excerpt: "La recherche sémantique trouve des contenus ; le graphe relie les personnes, décisions, projets et preuves." },
          { slug: "snd30-and-human-capital", href: href(l, "/blog/snd30-and-human-capital"), category: "Contexte de développement", title: "HCIL et les priorités de développement du Cameroun", excerpt: "Explorer une contribution possible aux objectifs de capital humain et d’emploi sans exagérer l’impact." },
        ],
        link: { label: "Lire tous les articles", href: href(l, "/blog") },
        readLabel: "Lire l’article",
        previewNote: "Aperçu éditorial : articles de démonstration ; vérifier les sources avant publication officielle.",
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
            a: "Le modèle prévu consiste à convenir du paiement de chaque contribution et à le relier au travail réalisé. Le traitement des paiements n’est pas encore disponible dans cet aperçu en accès anticipé.",
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

const fallbackSlides: Record<Locale, HeroSlide[]> = {
  en: [
    { id: "people", eyebrow: "Early access preview · People. Skills. Opportunity.", title: "Make your abilities visible. Find work that values them.", description: "HCIL helps people show what they can do and helps organizations understand the skills behind the work they need done.", imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=85", imageAlt: "A diverse team working together around a table", primary: { label: "I’m looking for opportunities", href: href("en", "/auth/sign-up") }, secondary: { label: "I’m hiring or building a team", href: "#for-companies" } },
    { id: "organizations", eyebrow: "For organizations and teams", title: "Start with the work. Find the people who can deliver it.", description: "Explain the result you need in everyday language. HCIL is being built to help turn that need into clear tasks and bring the right abilities together.", imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1800&q=85", imageAlt: "Colleagues planning a project together", primary: { label: "Explore the employer journey", href: "#for-companies" }, secondary: { label: "How HCIL works", href: "#how" } },
    { id: "learning", eyebrow: "A stronger way to show what you know", title: "Your experience is more than a job title or a certificate.", description: "Build a clearer picture of your skills through learning, practical assessments and work you can demonstrate.", imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=85", imageAlt: "Young adults learning and collaborating", primary: { label: "Create your talent profile", href: href("en", "/auth/sign-up") }, secondary: { label: "Discover our approach", href: href("en", "/about") } },
  ],
  fr: [
    { id: "people", eyebrow: "Aperçu en accès anticipé · Personnes. Compétences. Opportunités.", title: "Faites connaître vos compétences. Trouvez un travail qui les valorise.", description: "HCIL aide chacun à montrer ce qu’il sait faire et aide les organisations à comprendre les compétences nécessaires à leurs projets.", imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=85", imageAlt: "Une équipe diverse qui travaille ensemble autour d’une table", primary: { label: "Je cherche des opportunités", href: href("fr", "/auth/sign-up") }, secondary: { label: "Je recrute ou je forme une équipe", href: "#for-companies" } },
    { id: "organizations", eyebrow: "Pour les organisations et les équipes", title: "Partez du travail à réaliser. Trouvez les personnes capables de le faire.", description: "Expliquez simplement le résultat attendu. HCIL est conçu pour aider à organiser le travail et réunir les compétences adaptées.", imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1800&q=85", imageAlt: "Des collègues qui planifient un projet ensemble", primary: { label: "Découvrir le parcours des organisations", href: "#for-companies" }, secondary: { label: "Comment fonctionne HCIL", href: "#how" } },
    { id: "learning", eyebrow: "Montrez ce que vous savez faire", title: "Votre expérience ne se résume pas à un titre ou à un diplôme.", description: "Présentez vos compétences à travers l’apprentissage, des évaluations pratiques et des réalisations concrètes.", imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=85", imageAlt: "De jeunes adultes qui apprennent et collaborent", primary: { label: "Créer mon profil talent", href: href("fr", "/auth/sign-up") }, secondary: { label: "Découvrir notre approche", href: href("fr", "/about") } },
  ],
};

function isHeroSlide(value: unknown): value is HeroSlide {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<HeroSlide>;
  const safeHref = (hrefValue: unknown) => typeof hrefValue === "string" && (hrefValue.startsWith("/") || hrefValue.startsWith("#")) && !hrefValue.startsWith("//");
  const safeImage = (imageValue: unknown) => typeof imageValue === "string" && /^https:\/\/[a-z0-9.-]+(?:\/[^\s"'`()<>]*)?$/i.test(imageValue);
  return typeof item.id === "string" && typeof item.eyebrow === "string" && typeof item.title === "string" && typeof item.description === "string" && safeImage(item.imageUrl) && typeof item.imageAlt === "string" && !!item.primary && typeof item.primary.label === "string" && safeHref(item.primary.href) && !!item.secondary && typeof item.secondary.label === "string" && safeHref(item.secondary.href);
}

async function getPublishedHeroSlides(locale: Locale): Promise<HeroSlide[] | null> {
  try {
    const [row] = await db
      .select({ blocks: pageTranslations.blocks })
      .from(pages)
      .innerJoin(pageTranslations, eq(pageTranslations.pageId, pages.id))
      .innerJoin(platformLocales, eq(platformLocales.id, pageTranslations.localeId))
      .where(and(eq(pages.key, "home"), eq(platformLocales.tag, locale), eq(pageTranslations.status, "published")))
      .limit(1);
    if (!row) return null;
    const block = row.blocks.find((item) => item.type === "hero_slider");
    if (!block || !Array.isArray(block.props.slides)) return null;
    const slides = block.props.slides.filter(isHeroSlide);
    return slides.length ? slides : null;
  } catch (error) {
    // Public content remains available during a temporary CMS/database outage.
    console.error("[public-content] Unable to load published homepage slides", error);
    return null;
  }
}

// The page copy remains a typed fallback; published slider content is read from the canonical CMS tables.
export async function getHomeBlocks(locale: Locale): Promise<HomeBlock[]> {
  const blocks = locale === "fr" ? fr() : en();
  const slides = (await getPublishedHeroSlides(locale)) ?? fallbackSlides[locale];
  return [
    { type: "hero_slider", props: { label: locale === "fr" ? "À la une" : "Featured stories", slides } },
    ...blocks.filter((block) => block.type !== "hero"),
  ];
}
