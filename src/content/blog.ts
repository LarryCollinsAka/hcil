import type { Locale } from "@/lib/i18n";

export type BlogSection = { heading: string; paragraphs: string[]; bullets?: string[] };
export type BlogPost = {
  slug: string;
  category: string;
  publishedAt: string;
  readingMinutes: number;
  title: string;
  excerpt: string;
  sections: BlogSection[];
  sourceLinks?: { label: string; url: string }[];
  demo: true;
};

type BlogTranslations = Record<Locale, BlogPost[]>;
const posts: BlogTranslations = {
  en: [
    {
      slug: "capability-in-context", category: "HCIL principles", publishedAt: "2026-10-11", readingMinutes: 4, demo: true,
      title: "Why capability needs context", excerpt: "A skill label alone says little about whether someone can deliver a particular outcome, in a particular language, within a particular set of constraints.",
      sections: [
        { heading: "The job title is an incomplete signal", paragraphs: ["Two people can share the title “data analyst” and have very different strengths. One may excel at cleaning messy data; another may be stronger at statistical interpretation and business writing. Neither person's value is captured by a single title."] },
        { heading: "Describe the work before evaluating the person", paragraphs: ["HCIL is designed to start with the outcome, decompose it into reviewable packages, and state the required capabilities, language modalities, timelines and acceptance criteria. That makes assessment more specific and gives the worker a clearer target."] },
        { heading: "Context should make evidence more precise", paragraphs: ["An accepted spreadsheet-cleaning task is evidence of the specific work performed under recorded conditions. It is not automatic proof that the person can design a financial model, speak a language fluently or lead a team. Good evidence records both what was demonstrated and what remains unknown."] },
      ],
    },
    {
      slug: "work-packages-and-microteams", category: "Work design", publishedAt: "2026-10-11", readingMinutes: 5, demo: true,
      title: "Work packages make room for complementary skills", excerpt: "A project does not always need one person who can do everything. It needs a deliberate structure, clear ownership and verifiable handoffs.",
      sections: [
        { heading: "From vague request to deliverables", paragraphs: ["“Analyze our sales” leaves too much open. The request may actually require data cleaning, reconciliation, trend analysis, visualization and an executive summary. Each part can have its own definition of done."] },
        { heading: "Teams should be assembled only when needed", paragraphs: ["If one verified worker can deliver the whole package efficiently, adding people only adds coordination cost. If capabilities are complementary, HCIL could propose the smallest practical team that covers the required work and dependencies."] },
        { heading: "Acceptance and payout are not the same concept", paragraphs: ["The intended HCIL model separates milestones, which group package outcomes and funding checkpoints, from contributor assignments. A contributor's payout is designed to follow acceptance of their own assigned package rather than wait for every teammate, subject to the agreed commercial terms and working payment system."] },
      ],
    },
    {
      slug: "a-knowledge-graph-for-organizations", category: "AI architecture", publishedAt: "2026-10-11", readingMinutes: 6, demo: true,
      title: "Why an AI workforce platform needs a knowledge graph", excerpt: "Semantic search finds related material. A knowledge graph helps explain how people, teams, projects, decisions and evidence are connected.",
      sections: [
        { heading: "Similarity and relationships solve different problems", paragraphs: ["A vector search can retrieve a document because it is semantically close to a question. But to answer “Why is this deliverable blocked, who owns the dependency, and which decision changed the acceptance criteria?”, a system must follow explicit relationships and preserve the source of each fact."] },
        { heading: "Three stores, three responsibilities", bullets: ["PostgreSQL: authoritative business state and permissions.", "Knowledge graph: typed relationships among people, teams, work, documents, decisions and outcomes.", "Qdrant: semantic retrieval over text and evidence summaries."], paragraphs: ["These should be derived from a common source of truth rather than becoming three competing places to maintain business facts."] },
        { heading: "Memory needs provenance and access controls", paragraphs: ["Persistent agent memory should distinguish a recorded fact from an AI inference, a current policy from a superseded decision, and public context from private organizational data. Each agent should only retrieve the information its permissions allow."] },
      ],
    },
    {
      slug: "snd30-and-human-capital", category: "Development context", publishedAt: "2026-10-11", readingMinutes: 5, demo: true,
      title: "Connecting human-capital intelligence to Cameroon’s development priorities", excerpt: "SND30 places human capital, decent employment and training-to-employment links within the national development conversation. What could a platform contribute—and what must it not claim?",
      sections: [
        { heading: "A potential contribution, not a policy substitute", paragraphs: ["MINEPAT's SND30 describes human-capital development, decent employment, youth entrepreneurship and better alignment between training and employment. HCIL's intended role is narrower: make capability evidence more legible, structure work around measurable deliverables and record verified outcomes."] },
        { heading: "Measure outcomes before announcing impact", paragraphs: ["It would be premature to claim that HCIL reduces unemployment or achieves national targets before the platform has credible outcome data. Future evaluation could measure accepted work, worker earnings, skills progression backed by evidence, repeat employer use and access across regions and languages."] },
        { heading: "Independent and transparent", paragraphs: ["Referencing a public strategy is not endorsement. HCIL is an independent product in development and would need to work with relevant institutions and communities before claiming institutional alignment or reporting policy-level outcomes."] },
      ],
      sourceLinks: [{ label: "MINEPAT — SND30", url: "https://minepat.gov.cm/snd30/" }],
    },
    {
      slug: "agenda-2063-and-decent-work", category: "Policy context", publishedAt: "2026-10-11", readingMinutes: 5, demo: true,
      title: "From demonstrated skills to decent-work opportunities", excerpt: "Agenda 2063 and the UN Sustainable Development Goals provide a useful vocabulary for discussing skills, work, inclusion and partnerships—without confusing a product roadmap with achieved impact.",
      sections: [
        { heading: "The policy themes", paragraphs: ["The African Union's Agenda 2063 includes priorities around inclusive growth, jobs, education and skills, science and technology, and youth empowerment. The SDGs provide complementary targets around skills for employment and entrepreneurship, decent work, innovation, inequality and partnerships."] },
        { heading: "Where HCIL could contribute", bullets: ["Help organizations describe real work and required capabilities.", "Give workers a portable, evidence-backed record of specific demonstrated skills.", "Connect development pathways to observable work requirements.", "Produce outcome data only after it has been measured and validated."], paragraphs: ["These are potential contributions. They do not imply that HCIL is endorsed by the African Union, the United Nations or a government institution."] },
      ],
      sourceLinks: [
        { label: "African Union — Agenda 2063 aspirations", url: "https://au.int/en/agenda2063/aspirations" },
        { label: "United Nations — Sustainable Development Goals", url: "https://sdgs.un.org/goals" },
      ],
    },
  ],
  fr: [
    {
      slug: "capability-in-context", category: "Principes HCIL", publishedAt: "2026-10-11", readingMinutes: 4, demo: true,
      title: "Pourquoi une compétence doit être comprise en contexte", excerpt: "Une étiquette de compétence ne suffit pas pour savoir si une personne peut produire un résultat précis, dans une langue donnée et avec des contraintes particulières.",
      sections: [
        { heading: "L’intitulé de poste est un signal incomplet", paragraphs: ["Deux personnes peuvent avoir le titre d’« analyste de données » et des forces très différentes. L’une peut exceller dans le nettoyage de données désordonnées ; l’autre dans l’interprétation statistique et la rédaction. Un titre unique ne décrit pas toute leur valeur."] },
        { heading: "Décrire le travail avant d’évaluer la personne", paragraphs: ["HCIL est conçu pour partir du résultat, le décomposer en lots évaluables et préciser les compétences, modalités linguistiques, délais et critères d’acceptation. L’évaluation devient plus précise et la personne connaît mieux l’objectif."] },
        { heading: "Le contexte rend les preuves plus précises", paragraphs: ["Un travail accepté de nettoyage de tableur constitue une preuve du travail effectué dans des conditions documentées. Il ne prouve pas automatiquement que la personne peut construire un modèle financier, parler couramment une langue ou diriger une équipe. Une bonne preuve décrit aussi ce qui reste inconnu."] },
      ],
    },
    {
      slug: "work-packages-and-microteams", category: "Organisation du travail", publishedAt: "2026-10-11", readingMinutes: 5, demo: true,
      title: "Les lots de travail valorisent les compétences complémentaires", excerpt: "Un projet n’a pas toujours besoin d’une personne qui sait tout faire. Il lui faut une structure réfléchie, des responsabilités claires et des transmissions vérifiables.",
      sections: [
        { heading: "D’une demande vague à des livrables", paragraphs: ["« Analysez nos ventes » laisse trop de zones grises. La demande peut en réalité exiger le nettoyage de données, le rapprochement, l’analyse des tendances, la visualisation et une synthèse exécutive. Chaque partie peut avoir son propre critère de réussite."] },
        { heading: "Ne former une équipe que lorsque c’est utile", paragraphs: ["Si une personne dont les capacités sont vérifiées peut livrer efficacement tout le lot, ajouter des contributeurs augmente seulement les coûts de coordination. Si les compétences sont complémentaires, HCIL pourrait proposer la plus petite équipe pratique couvrant le travail et ses dépendances."] },
        { heading: "Acceptation et paiement sont deux notions différentes", paragraphs: ["Le modèle prévu distingue les jalons, qui regroupent les résultats et les points de financement, des affectations individuelles. Le paiement convenu d’un contributeur doit suivre l’acceptation de son propre lot attribué, au lieu d’attendre toute l’équipe, selon les conditions commerciales et un système de paiement opérationnel."] },
      ],
    },
    {
      slug: "a-knowledge-graph-for-organizations", category: "Architecture IA", publishedAt: "2026-10-11", readingMinutes: 6, demo: true,
      title: "Pourquoi une plateforme d’intelligence du travail a besoin d’un graphe de connaissances", excerpt: "La recherche sémantique trouve des contenus pertinents. Un graphe explique comment les personnes, équipes, projets, décisions et preuves sont reliés.",
      sections: [
        { heading: "La similarité et les relations répondent à des questions différentes", paragraphs: ["Une recherche vectorielle peut retrouver un document proche d’une question. Mais répondre à « Pourquoi ce livrable est-il bloqué, qui est responsable de la dépendance et quelle décision a changé les critères d’acceptation ? » nécessite de parcourir des relations explicites et de conserver la source de chaque fait."] },
        { heading: "Trois systèmes, trois responsabilités", bullets: ["PostgreSQL : état métier officiel et permissions.", "Graphe de connaissances : relations typées entre personnes, équipes, travail, documents, décisions et résultats.", "Qdrant : recherche sémantique dans les textes et résumés de preuves."], paragraphs: ["Ces systèmes doivent dériver d’une source de vérité commune, au lieu de devenir trois lieux concurrents où maintenir les faits métier."] },
        { heading: "La mémoire exige provenance et contrôles d’accès", paragraphs: ["La mémoire persistante des agents doit distinguer un fait enregistré d’une inférence IA, une politique actuelle d’une décision remplacée, et le contexte public des données privées d’une organisation. Chaque agent ne doit retrouver que les informations autorisées."] },
      ],
    },
    {
      slug: "snd30-and-human-capital", category: "Contexte de développement", publishedAt: "2026-10-11", readingMinutes: 5, demo: true,
      title: "Relier l’intelligence du capital humain aux priorités de développement du Cameroun", excerpt: "La SND30 place le capital humain, l’emploi décent et le lien entre formation et emploi dans le débat national. Que pourrait apporter une plateforme — et que ne doit-elle pas prétendre ?",
      sections: [
        { heading: "Une contribution possible, pas un substitut aux politiques publiques", paragraphs: ["La SND30 du MINEPAT évoque le développement du capital humain, l’emploi décent, l’entrepreneuriat des jeunes et une meilleure adéquation entre formation et emploi. Le rôle visé par HCIL est plus précis : rendre les preuves de compétences lisibles, structurer le travail autour de livrables mesurables et enregistrer des résultats vérifiés."] },
        { heading: "Mesurer avant d’annoncer un impact", paragraphs: ["Il serait prématuré d’affirmer que HCIL réduit le chômage ou atteint les objectifs nationaux sans données fiables sur les résultats. Une évaluation future pourrait mesurer le travail accepté, les revenus des travailleurs, la progression des compétences étayée par des preuves, le retour des entreprises et l’accès selon les régions et les langues."] },
        { heading: "Indépendance et transparence", paragraphs: ["Citer une stratégie publique ne signifie pas être approuvé. HCIL est un produit indépendant en développement et devra collaborer avec les institutions et communautés concernées avant de revendiquer un alignement institutionnel ou des résultats au niveau des politiques publiques."] },
      ],
      sourceLinks: [{ label: "MINEPAT — SND30", url: "https://minepat.gov.cm/snd30/" }],
    },
    {
      slug: "agenda-2063-and-decent-work", category: "Contexte politique", publishedAt: "2026-10-11", readingMinutes: 5, demo: true,
      title: "Des compétences démontrées aux opportunités de travail décent", excerpt: "Agenda 2063 et les Objectifs de développement durable offrent un vocabulaire utile pour parler de compétences, de travail, d’inclusion et de partenariats, sans confondre une feuille de route produit avec un impact déjà obtenu.",
      sections: [
        { heading: "Les thèmes de développement", paragraphs: ["Agenda 2063 de l’Union africaine comprend des priorités sur la croissance inclusive, l’emploi, l’éducation et les compétences, les sciences et technologies et l’autonomisation des jeunes. Les ODD complètent ces thèmes par des cibles sur les compétences pour l’emploi et l’entrepreneuriat, le travail décent, l’innovation, les inégalités et les partenariats."] },
        { heading: "Contribution possible de HCIL", bullets: ["Aider les organisations à décrire un travail réel et les capacités nécessaires.", "Donner aux travailleurs un dossier portable de compétences précises étayées par des preuves.", "Relier les parcours de développement aux exigences observables du travail.", "Publier des données de résultats uniquement après mesure et validation."], paragraphs: ["Il s’agit de contributions potentielles. Elles ne signifient pas que HCIL est approuvé par l’Union africaine, les Nations Unies ou une institution gouvernementale."] },
      ],
      sourceLinks: [
        { label: "Union africaine — Aspirations d’Agenda 2063", url: "https://au.int/en/agenda2063/aspirations" },
        { label: "Nations Unies — Objectifs de développement durable", url: "https://sdgs.un.org/goals" },
      ],
    },
  ],
};

export function getBlogPosts(locale: Locale): BlogPost[] {
  return posts[locale] ?? posts.en;
}

export function getBlogPost(locale: Locale, slug: string): BlogPost | undefined {
  return getBlogPosts(locale).find((post) => post.slug === slug);
}

export const BLOG_SEED_RECORDS = posts;
