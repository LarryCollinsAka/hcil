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
      title: "Why skills need to be understood in context", excerpt: "A skill label alone does not show whether someone can complete a particular task, communicate with the people involved or work within the conditions of a project.",
      sections: [
        { heading: "The job title is an incomplete signal", paragraphs: ["Two people can share the title “data analyst” and have very different strengths. One may excel at cleaning messy data; another may be stronger at statistical interpretation and business writing. Neither person's value is captured by a single title."] },
        { heading: "Understand the work before considering the person", paragraphs: ["HCIL is designed to start with the result an organization needs, make the tasks clear and explain the skills, language needs and deadlines involved. This gives everyone a clearer understanding of the work."] },
        { heading: "Context should make evidence more precise", paragraphs: ["An accepted spreadsheet-cleaning task is evidence of the specific work performed under recorded conditions. It is not automatic proof that the person can design a financial model, speak a language fluently or lead a team. Good evidence records both what was demonstrated and what remains unknown."] },
      ],
    },
    {
      slug: "work-packages-and-microteams", category: "Work design", publishedAt: "2026-10-11", readingMinutes: 5, demo: true,
      title: "Clear tasks make room for complementary skills", excerpt: "A project does not always need one person who can do everything. It needs clear tasks, responsibilities and a shared understanding of what has been completed.",
      sections: [
        { heading: "From a vague request to clear tasks", paragraphs: ["“Analyze our sales” can mean many things. The work may include organizing the data, checking figures, finding trends, preparing charts and writing a short summary. Each task should have a clear expected result."] },
        { heading: "Teams should be assembled only when needed", paragraphs: ["If one person has the right skills to complete the work, adding more people may make the project harder to coordinate. When different skills are needed, HCIL could help suggest a small team that covers the tasks."] },
        { heading: "Agreeing on project stages and individual contributions", paragraphs: ["The planned HCIL approach distinguishes overall project stages from each person’s contribution. The aim is to make responsibilities and payment agreements clear for each person. Payment processing is not yet available in this early-access preview."] },
      ],
    },
    {
      slug: "a-knowledge-graph-for-organizations", category: "AI architecture", publishedAt: "2026-10-11", readingMinutes: 6, demo: true,
      title: "How AI can connect information across an organization", excerpt: "AI can help find useful information and show how people, teams, projects, decisions and results relate to one another.",
      sections: [
        { heading: "Finding information and understanding its connections", paragraphs: ["A search can find a document that appears relevant to a question. But to answer “Why is this task delayed, who is responsible, and what changed?”, HCIL needs to connect the people, tasks and decisions involved and show where the information came from."] },
        { heading: "Keep important information consistent", bullets: ["One trusted record: the official details about people, organizations, projects and decisions.", "Connected information: how people, teams, work, documents, decisions and results relate.", "AI-assisted search: find useful information even when different words are used."], paragraphs: ["These parts should work from the same trusted information so that people are not left with conflicting versions of the facts."] },
        { heading: "Private information must stay protected", paragraphs: ["AI assistants should distinguish recorded facts from suggestions, current decisions from older ones, and public information from private company details. Each person should only see information they are allowed to access."] },
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
      title: "Pourquoi les compétences doivent être comprises dans leur contexte", excerpt: "Une liste de compétences ne suffit pas pour savoir si une personne peut réaliser une tâche, communiquer avec les personnes concernées et respecter les conditions d’un projet.",
      sections: [
        { heading: "L’intitulé de poste est un signal incomplet", paragraphs: ["Deux personnes peuvent avoir le titre d’« analyste de données » et des forces très différentes. L’une peut exceller dans le nettoyage de données désordonnées ; l’autre dans l’interprétation statistique et la rédaction. Un titre unique ne décrit pas toute leur valeur."] },
        { heading: "Comprendre le travail avant de considérer les profils", paragraphs: ["HCIL est conçu pour partir du résultat recherché, clarifier les tâches et préciser les compétences, les langues et les délais nécessaires. Chacun comprend ainsi mieux le travail à réaliser."] },
        { heading: "Le contexte rend les preuves plus précises", paragraphs: ["Un travail accepté de nettoyage de tableur constitue une preuve du travail effectué dans des conditions documentées. Il ne prouve pas automatiquement que la personne peut construire un modèle financier, parler couramment une langue ou diriger une équipe. Une bonne preuve décrit aussi ce qui reste inconnu."] },
      ],
    },
    {
      slug: "work-packages-and-microteams", category: "Organisation du travail", publishedAt: "2026-10-11", readingMinutes: 5, demo: true,
      title: "Des tâches claires permettent de réunir des compétences complémentaires", excerpt: "Un projet n’a pas toujours besoin d’une personne qui sait tout faire. Il a besoin de tâches claires, de responsabilités définies et d’une compréhension commune du travail terminé.",
      sections: [
        { heading: "D’une demande vague à des tâches claires", paragraphs: ["« Analysez nos ventes » peut vouloir dire beaucoup de choses. Le travail peut inclure l’organisation des données, la vérification des chiffres, la recherche de tendances, la création de graphiques et la rédaction d’un résumé. Chaque tâche doit avoir un résultat attendu."] },
        { heading: "Ne former une équipe que lorsque c’est utile", paragraphs: ["Si une personne possède les compétences nécessaires, ajouter d’autres personnes peut compliquer le projet. Lorsque plusieurs compétences sont utiles, HCIL pourrait aider à réunir une petite équipe adaptée aux tâches."] },
        { heading: "Distinguer les étapes du projet et les contributions individuelles", paragraphs: ["Le modèle prévu distingue les grandes étapes d’un projet de la contribution de chaque personne. L’objectif est de clarifier les responsabilités et les accords de paiement. Le traitement des paiements n’est pas encore disponible dans cet aperçu en accès anticipé."] },
      ],
    },
    {
      slug: "a-knowledge-graph-for-organizations", category: "Architecture IA", publishedAt: "2026-10-11", readingMinutes: 6, demo: true,
      title: "Comment l’IA peut relier les informations d’une organisation", excerpt: "L’IA peut aider à retrouver des informations utiles et à montrer les liens entre les personnes, les équipes, les projets, les décisions et les résultats.",
      sections: [
        { heading: "Retrouver une information et comprendre ses liens", paragraphs: ["Une recherche peut trouver un document qui semble répondre à une question. Mais pour savoir « Pourquoi cette tâche est-elle retardée, qui en est responsable et qu’est-ce qui a changé ? », HCIL doit relier les personnes, les tâches et les décisions, tout en indiquant l’origine des informations."] },
        { heading: "Garder les informations cohérentes", bullets: ["Un dossier fiable : les informations officielles sur les personnes, les organisations, les projets et les décisions.", "Des informations reliées : les liens entre les personnes, les équipes, le travail, les documents, les décisions et les résultats.", "Recherche assistée par l’IA : retrouver des informations utiles même lorsque les mots employés sont différents."], paragraphs: ["Ces éléments doivent s’appuyer sur les mêmes informations fiables afin d’éviter plusieurs versions contradictoires des faits."] },
        { heading: "Les informations privées doivent rester protégées", paragraphs: ["Les assistants IA doivent distinguer les faits enregistrés des suggestions, les décisions actuelles des anciennes et les informations publiques des données privées d’une entreprise. Chaque personne ne doit voir que les informations auxquelles elle a accès."] },
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
