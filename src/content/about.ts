import type { Locale } from "@/lib/i18n";

export type AboutSlug = "overview" | "mission" | "intelligence" | "policy-alignment" | "trust";
export type AboutSection = { heading: string; paragraphs: string[]; bullets?: string[] };
export type PolicySource = { name: string; publisher: string; url: string; relevance: string; statusNote?: string };
export type AboutPageData = {
  slug: AboutSlug;
  label: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: AboutSection[];
  principles?: { title: string; text: string }[];
  sources?: PolicySource[];
  notice?: string;
};

const aboutPages: Record<Locale, Record<AboutSlug, AboutPageData>> = {
  en: {
    overview: {
      slug: "overview", label: "Overview", eyebrow: "About HCIL", title: "A different way to understand and organize human capability.",
      intro: "HCIL is being designed as a Human Capital Intelligence Lifecycle: a system that connects what organizations need, what people can demonstrate, how capabilities grow, and what happens when people do real work.",
      sections: [
        { heading: "Why this exists", paragraphs: ["Hiring often begins with job titles, certificates and CVs. Those signals can be useful, but they do not always show whether someone can deliver a particular outcome under the conditions of a specific project.", "HCIL starts with the work. It structures an outcome into reviewable packages, identifies the capabilities and languages each package needs, and connects those requirements to relevant evidence."] },
        { heading: "The lifecycle", paragraphs: ["Profile → Assess → Diagnose → Develop → Verify → Match → Execute → Measure → Evolve. The intended system uses each stage to improve the next, rather than ending when a candidate is hired or a course is completed."] },
        { heading: "A platform, not an endorsement", paragraphs: ["HCIL is an independent product concept in development. References to public strategies describe areas of potential contribution; they do not imply a partnership, certification, government approval or official endorsement."] },
      ],
    },
    mission: {
      slug: "mission", label: "Mission & approach", eyebrow: "Our mission", title: "Make demonstrated capability easier to see, develop and put to work.",
      intro: "HCIL aims to help people participate in meaningful work through evidence of what they can do—not one universal score, one job title, or one credential alone.",
      sections: [
        { heading: "Start with outcomes", paragraphs: ["Organizations describe a business need in their own words. The platform is designed to clarify the outcome, identify unknowns and propose work packages with deliverables, dependencies, timelines and acceptance criteria."] },
        { heading: "Match in context", paragraphs: ["A capability matters in relation to the work. HCIL is designed to consider the exact required capability, relevant evidence, language by modality, availability and constraints. A person can be a strong fit for one package and not another without being reduced to a global talent score."] },
        { heading: "Make room for complementary skills", paragraphs: ["When no single person covers all requirements, HCIL can propose a small team whose combined capabilities fit the work. The employer reviews the proposed structure and remains in control of consequential decisions."] },
        { heading: "Turn work into evidence", paragraphs: ["Where a deliverable is accepted, its record can become evidence of the capabilities actually demonstrated under those specific conditions. Acceptance of one task is not treated as proof of every skill a person claims."] },
      ],
      principles: [
        { title: "No universal talent score", text: "Capability is multidimensional, evidence-backed and specific to context." },
        { title: "Language by modality", text: "Reading, writing, listening and speaking are not interchangeable." },
        { title: "Human accountability", text: "AI can recommend; authorized people and explicit rules govern high-impact actions." },
      ],
    },
    intelligence: {
      slug: "intelligence", label: "How intelligence works", eyebrow: "Organizational intelligence", title: "Understand how the company works—not only what a document says.",
      intro: "The intended HCIL intelligence layer connects people, teams, projects, documents, decisions, capabilities, deliverables and outcomes. It gives agents shared organizational context across sessions while keeping authoritative records and permissions in control.",
      sections: [
        { heading: "1. Authoritative business records", paragraphs: ["PostgreSQL is intended to hold the authoritative records: organizations, people and memberships, approved work packages, capability evidence, submissions, acceptance decisions and commercial commitments. AI-generated suggestions do not silently become business truth."] },
        { heading: "2. A knowledge graph for relationships", paragraphs: ["A graph layer such as FalkorDB can connect people to teams, teams to projects, projects to documents, decisions to the policies that support them, work packages to required capabilities, and outcomes to the evidence they produced. The graph helps answer multi-step questions by traversing relationships instead of relying only on matching words."] },
        { heading: "3. Semantic retrieval", paragraphs: ["Qdrant is intended to retrieve semantically relevant descriptions, document passages and evidence summaries even when they use different wording. A vector match is a retrieval signal, not proof that a person is qualified or that a fact is true."] },
        { heading: "4. Agents with governed shared memory", paragraphs: ["The orchestrator can call specialist tools for work planning, capability/evidence retrieval and delivery coordination. Persistent workflow state preserves interrupted tasks; validated organizational facts, decision history and source documents can be recalled in later sessions. Each agent sees only the data its permissions allow."] },
        { heading: "5. Act, verify and learn", paragraphs: ["Agents should propose changes through domain commands. Work, acceptance and payments remain governed by deterministic rules and authorized approvals. Events update graph and vector projections; accepted work can create new capability evidence after the authoritative acceptance record exists."] },
      ],
      notice: "This describes the target architecture under development. It is not a claim that autonomous agents, persistent organizational memory, graph retrieval or payments are already available in production.",
    },
    "policy-alignment": {
      slug: "policy-alignment", label: "Policy alignment", eyebrow: "Development context", title: "Designed around priorities that matter—from Cameroon to the world.",
      intro: "HCIL's intended focus—capability development, evidence of skills, work access, inclusion and measurable outcomes—has clear points of relevance to public development frameworks. This is a mapping of potential contribution, not a claim of official alignment, endorsement, funding or partnership.",
      sections: [
        { heading: "Cameroon: SND30", paragraphs: ["Cameroon's National Development Strategy 2020–2030 (SND30), published by MINEPAT, discusses structural economic transformation, human-capital development and well-being, promotion of decent employment, entrepreneurship, and better alignment between training and employment. HCIL could contribute by making capabilities more visible, connecting practical evidence to work requirements, and measuring outcomes from accepted work.", "The platform cannot replace national policy, public employment services, education institutions or labour protections. It could be one tool that complements these efforts if designed, tested and adopted with relevant stakeholders."] },
        { heading: "Central Africa: CEMAC and ECCAS", paragraphs: ["CEMAC's common-market and economic-integration priorities provide context for a platform designed to make capabilities discoverable across borders. ECCAS has also pursued regional integration and development programmes. HCIL could explore interoperable capability records, multilingual work requirements and regional skills-demand insights, while respecting the laws and institutions of each country.", "Regional programmes evolve. The links below point to public institutional material; HCIL does not claim formal approval or alignment with a current regional programme."] },
        { heading: "African Union: Agenda 2063", paragraphs: ["Agenda 2063 includes priorities around inclusive growth, jobs and decent work, education and skills, science/technology/innovation, and youth empowerment. HCIL's potential contribution is practical: help people demonstrate relevant capabilities, support team-based delivery and generate more transparent evidence about work and skill development."] },
        { heading: "United Nations: SDGs and country cooperation", paragraphs: ["The closest connections include SDG 4.4 (relevant skills for employment, decent work and entrepreneurship), SDG 8 (decent work and economic growth), SDG 9 (industry, innovation and infrastructure), SDG 10 (reduced inequalities), and SDG 17 (partnerships). The UN's Cameroon Cooperation Framework for 2022–2026 explicitly connected SDGs, Agenda 2063 and SND30; the next 2027–2031 framework was being co-designed in 2025–2026, so this page does not present the older framework as the current cycle."] },
        { heading: "How we will measure contribution", paragraphs: ["We should report evidence, not aspirations as results. Future indicators could include people completing verified work, acceptance rates by package type, income actually earned, capability growth backed by new evidence, participation by women and underserved groups, language accessibility, and employer repeat usage. These metrics should only be published once they are measured reliably."] },
      ],
      sources: [
        { name: "National Development Strategy 2020–2030 (SND30)", publisher: "MINEPAT, Cameroon", url: "https://minepat.gov.cm/snd30/", relevance: "National context for human capital, decent employment, entrepreneurship and training-to-employment links." },
        { name: "CEMAC common market and AfCFTA context", publisher: "CEMAC Commission", url: "https://cemac.int/2025/03/22/okwelians-summit-le-marche-commun-de-la-cemac-face-a-la-zlecaf-vu-par-le-commissaire-mbogo-ngabo-seli/", relevance: "Regional economic integration and the role of regional value chains." },
        { name: "Medium-term strategic plan 2021–2025", publisher: "ECCAS / CEEAC", url: "https://www.ceeac-eccas.org/2021/01/07/ceeac-quelle-strategie-pour-mobiliser-les-ressources/", relevance: "Historical institutional source on ECCAS regional programmes; its period has ended, so verify successor frameworks before claiming current alignment.", statusNote: "Reference document for context, not a claim that the 2021–2025 plan is still current." },
        { name: "Agenda 2063: Aspirations", publisher: "African Union", url: "https://au.int/en/agenda2063/aspirations", relevance: "Inclusive growth, jobs, skills, science and technology, and youth empowerment." },
        { name: "Sustainable Development Goals", publisher: "United Nations", url: "https://sdgs.un.org/goals", relevance: "Relevant global goals include SDGs 4, 8, 9, 10 and 17." },
        { name: "Cameroon–UN Cooperation Framework 2022–2026", publisher: "United Nations in Cameroon", url: "https://cameroon.un.org/en/166184-united-nations-sustainable-development-cooperation-framework-cameroon-2022-2026", relevance: "Reference for how the prior UN–Cameroon cooperation cycle linked SDGs, Agenda 2063 and SND30.", statusNote: "This cycle ends in 2026; see the UN's update on preparation of the 2027–2031 framework." },
        { name: "Preparing the 2027–2031 Cooperation Framework", publisher: "United Nations in Cameroon", url: "https://cameroon.un.org/en/310788-cameroon-and-united-nations-building-next-cooperation-framework-together", relevance: "2026 update describing the next framework's co-design and intended link to SND30 and the SDGs." },
      ],
      notice: "HCIL is an independent initiative. Mention of public frameworks indicates potential thematic contribution only; it must not be interpreted as official partnership, approval, certification or endorsement.",
    },
    trust: {
      slug: "trust", label: "Trust & governance", eyebrow: "Trust by design", title: "Intelligence must be traceable, contextual and permission-aware.",
      intro: "A human-capital platform should not turn uncertain inferences into facts or make important decisions on a hidden score. HCIL is being designed around evidence, explicit authority and clear boundaries on how data is used.",
      sections: [
        { heading: "Evidence has provenance", paragraphs: ["Capability evidence should record what was assessed or delivered, the relevant context, who or what reviewed it, when it was created, and its verification state. Self-reported, AI-inferred, assessor-reviewed and employer-accepted evidence must remain distinguishable."] },
        { heading: "Shared memory is not shared access", paragraphs: ["Agents can reuse verified organizational knowledge across sessions, but access is scoped by organization, role, purpose and data permission. One company's documents or graph relationships must never leak to another company's agents."] },
        { heading: "AI proposes; rules and authorized people decide", paragraphs: ["The model may clarify a request, suggest a work decomposition or explain why evidence is relevant. Assignment, acceptance, access changes and financial operations must use authorized commands, deterministic validations, and human approval where appropriate."] },
        { heading: "Workers control professional sharing", paragraphs: ["The planned capability passport and QR verification flow should expose only the profile information the worker chooses to share, through revocable and scoped links. Sensitive source artifacts should not become public merely because they contributed to a capability assessment."] },
        { heading: "Learn without overstating", paragraphs: ["Accepted work can update evidence for the specific capabilities demonstrated. A single accepted task does not prove broad professional competence, and no universal employability or intelligence score should be created from the data."] },
      ],
      notice: "These are design commitments for the platform under development. Operational controls must be implemented and tested before HCIL makes production security or privacy claims.",
    },
  },
  fr: {
    overview: {
      slug: "overview", label: "Vue d’ensemble", eyebrow: "À propos de HCIL", title: "Une autre manière de comprendre et d’organiser les capacités humaines.",
      intro: "HCIL est conçu comme un cycle d’intelligence du capital humain : un système qui relie les besoins des organisations, les capacités que les personnes peuvent démontrer, leur développement et les résultats du travail réel.",
      sections: [
        { heading: "Pourquoi cette initiative", paragraphs: ["Le recrutement commence souvent par les intitulés de poste, les diplômes et les CV. Ces signaux peuvent être utiles, mais ne montrent pas toujours si une personne peut obtenir un résultat précis dans les conditions d’un projet donné.", "HCIL part du travail à accomplir. Il structure un résultat en lots évaluables, identifie les compétences et langues nécessaires et relie ces exigences aux preuves pertinentes."] },
        { heading: "Le cycle", paragraphs: ["Profil → Évaluer → Diagnostiquer → Développer → Vérifier → Associer → Exécuter → Mesurer → Évoluer. Chaque étape doit améliorer la suivante, au lieu de s’arrêter à l’embauche ou à la fin d’une formation."] },
        { heading: "Une plateforme, pas une approbation officielle", paragraphs: ["HCIL est un concept de produit indépendant en cours de développement. Les références aux stratégies publiques indiquent des domaines de contribution possible ; elles ne signifient ni partenariat, ni certification, ni approbation ou soutien officiel."] },
      ],
    },
    mission: {
      slug: "mission", label: "Mission et approche", eyebrow: "Notre mission", title: "Rendre les capacités démontrées plus visibles, développables et utiles au travail.",
      intro: "HCIL vise à faciliter l’accès au travail grâce à des preuves de ce que les personnes savent faire, sans score universel, intitulé de poste ou diplôme unique.",
      sections: [
        { heading: "Partir du résultat", paragraphs: ["L’organisation décrit son besoin avec ses propres mots. La plateforme doit clarifier le résultat, repérer les informations manquantes et proposer des lots de travail avec livrables, dépendances, délais et critères d’acceptation."] },
        { heading: "Associer en contexte", paragraphs: ["Une capacité prend son sens par rapport au travail. HCIL est conçu pour tenir compte de la compétence précise, des preuves pertinentes, des langues par modalité, de la disponibilité et des contraintes. Une personne peut convenir à un lot et moins à un autre, sans être réduite à un score global."] },
        { heading: "Valoriser les compétences complémentaires", paragraphs: ["Lorsqu’une seule personne ne couvre pas toutes les exigences, HCIL peut proposer une petite équipe dont les compétences combinées répondent au besoin. L’organisation examine la proposition et conserve le contrôle des décisions importantes."] },
        { heading: "Transformer le travail en preuve", paragraphs: ["Lorsqu’un livrable est accepté, son dossier peut devenir une preuve des compétences réellement démontrées dans ces conditions précises. L’acceptation d’une tâche ne prouve pas automatiquement toutes les compétences revendiquées."] },
      ],
      principles: [
        { title: "Pas de score de talent universel", text: "Les capacités sont multidimensionnelles, étayées par des preuves et liées au contexte." },
        { title: "La langue par modalité", text: "Lire, écrire, écouter et parler ne sont pas interchangeables." },
        { title: "Responsabilité humaine", text: "L’IA peut recommander ; les règles et les personnes autorisées contrôlent les décisions importantes." },
      ],
    },
    intelligence: {
      slug: "intelligence", label: "Fonctionnement de l’intelligence", eyebrow: "Intelligence organisationnelle", title: "Comprendre le fonctionnement de l’entreprise, pas seulement le contenu d’un document.",
      intro: "La couche d’intelligence prévue pour HCIL relie personnes, équipes, projets, documents, décisions, compétences, livrables et résultats. Elle fournit aux agents un contexte organisationnel partagé entre les sessions, tout en préservant l’autorité des données et les permissions.",
      sections: [
        { heading: "1. Données de référence", paragraphs: ["PostgreSQL doit conserver les données de référence : organisations, personnes et membres, lots approuvés, preuves, soumissions, décisions d’acceptation et engagements commerciaux. Une suggestion de l’IA ne devient pas automatiquement une donnée métier officielle."] },
        { heading: "2. Un graphe pour relier les informations", paragraphs: ["Une couche graphe telle que FalkorDB peut relier les personnes aux équipes, les équipes aux projets, les projets aux documents, les décisions aux politiques qui les justifient, les lots aux compétences requises et les résultats aux preuves produites. Elle facilite les questions à plusieurs étapes en parcourant les relations plutôt qu’en comparant seulement des mots."] },
        { heading: "3. Recherche sémantique", paragraphs: ["Qdrant est destiné à retrouver des descriptions, passages de documents et résumés de preuves sémantiquement pertinents même lorsque les mots diffèrent. Une proximité vectorielle est un signal de recherche, pas la preuve qu’une personne est qualifiée ou qu’un fait est vrai."] },
        { heading: "4. Des agents avec une mémoire partagée gouvernée", paragraphs: ["L’orchestrateur peut appeler des outils spécialisés pour planifier le travail, retrouver les preuves et coordonner la livraison. L’état persistant permet de reprendre un processus interrompu ; les faits organisationnels validés, l’historique des décisions et les sources peuvent être retrouvés dans une autre session. Chaque agent ne voit que les données autorisées."] },
        { heading: "5. Agir, vérifier et apprendre", paragraphs: ["Les agents doivent proposer les changements via des commandes métier. Le travail, l’acceptation et les paiements restent contrôlés par des règles déterministes et des validations autorisées. Les événements actualisent les projections du graphe et les index vectoriels ; un travail accepté peut créer une nouvelle preuve de compétence après l’enregistrement officiel de l’acceptation."] },
      ],
      notice: "Il s’agit de l’architecture cible en cours de développement, et non d’une affirmation que les agents autonomes, la mémoire organisationnelle persistante, la recherche par graphe ou les paiements sont déjà disponibles en production.",
    },
    "policy-alignment": {
      slug: "policy-alignment", label: "Cadres de référence", eyebrow: "Contexte de développement", title: "Conçu autour de priorités importantes, du Cameroun au monde.",
      intro: "Les objectifs visés par HCIL — développement des compétences, preuves de savoir-faire, accès au travail, inclusion et résultats mesurables — présentent des liens thématiques avec des cadres publics de développement. Il s’agit d’une cartographie de contribution potentielle, pas d’une déclaration d’alignement officiel, de soutien, de financement ou de partenariat.",
      sections: [
        { heading: "Cameroun : SND30", paragraphs: ["La Stratégie Nationale de Développement 2020–2030 (SND30), publiée par le MINEPAT, traite de la transformation structurelle de l’économie, du développement du capital humain et du bien-être, de la promotion de l’emploi décent, de l’entrepreneuriat et d’une meilleure adéquation entre formation et emploi. HCIL pourrait contribuer en rendant les capacités plus visibles, en reliant les preuves pratiques aux exigences du travail et en mesurant les résultats du travail accepté.", "La plateforme ne remplace ni la politique nationale, ni les services publics de l’emploi, ni les établissements d’enseignement, ni les protections du travail. Elle pourrait compléter ces efforts si elle est conçue, testée et adoptée avec les parties prenantes concernées."] },
        { heading: "Afrique centrale : CEMAC et CEEAC", paragraphs: ["Les priorités du marché commun et de l’intégration économique de la CEMAC offrent un contexte pour une plateforme qui rend les capacités repérables au-delà des frontières. La CEEAC a également mené des programmes d’intégration et de développement régionaux. HCIL pourrait explorer des dossiers de compétences interopérables, des exigences de travail multilingues et des analyses régionales de la demande, dans le respect des lois et institutions de chaque pays.", "Les programmes régionaux évoluent. Les liens ci-dessous renvoient à des sources institutionnelles publiques ; HCIL ne revendique pas d’approbation ni d’alignement formel avec un programme régional en vigueur."] },
        { heading: "Union africaine : Agenda 2063", paragraphs: ["Agenda 2063 comprend des priorités liées à la croissance inclusive, à l’emploi décent, à l’éducation et aux compétences, aux sciences, aux technologies et à l’innovation, ainsi qu’à l’autonomisation des jeunes. La contribution possible de HCIL est pratique : aider les personnes à démontrer leurs capacités, soutenir le travail en équipe et produire des preuves plus transparentes du travail et du développement des compétences."] },
        { heading: "Nations Unies : ODD et coopération dans le pays", paragraphs: ["Les liens les plus proches concernent l’ODD 4.4 (compétences utiles à l’emploi et à l’entrepreneuriat), l’ODD 8 (travail décent et croissance économique), l’ODD 9 (industrie, innovation et infrastructures), l’ODD 10 (réduction des inégalités) et l’ODD 17 (partenariats). Le Cadre de coopération ONU–Cameroun 2022–2026 reliait explicitement les ODD, Agenda 2063 et la SND30 ; le cadre suivant 2027–2031 était en cours de co-conception en 2025–2026. Cette page ne présente donc pas le cycle précédent comme le cycle actuel."] },
        { heading: "Comment mesurer la contribution", paragraphs: ["Nous devons publier des preuves, pas présenter des aspirations comme des résultats. De futurs indicateurs pourraient inclure les personnes ayant réalisé du travail vérifié, les taux d’acceptation par type de lot, les revenus réellement perçus, l’évolution des compétences appuyée par de nouvelles preuves, la participation des femmes et des groupes moins desservis, l’accessibilité linguistique et le retour des entreprises. Ces indicateurs ne doivent être publiés qu’une fois mesurés de manière fiable."] },
      ],
      sources: [
        { name: "Stratégie Nationale de Développement 2020–2030 (SND30)", publisher: "MINEPAT, Cameroun", url: "https://minepat.gov.cm/snd30/", relevance: "Contexte national sur le capital humain, l’emploi décent, l’entrepreneuriat et les liens entre formation et emploi." },
        { name: "Marché commun de la CEMAC et contexte ZLECAf", publisher: "Commission de la CEMAC", url: "https://cemac.int/2025/03/22/okwelians-summit-le-marche-commun-de-la-cemac-face-a-la-zlecaf-vu-par-le-commissaire-mbogo-ngabo-seli/", relevance: "Intégration économique régionale et rôle des chaînes de valeur." },
        { name: "Plan stratégique indicatif à moyen terme 2021–2025", publisher: "CEEAC", url: "https://www.ceeac-eccas.org/2021/01/07/ceeac-quelle-strategie-pour-mobiliser-les-ressources/", relevance: "Source institutionnelle historique sur les programmes régionaux ; la période est terminée, vérifier les cadres successeurs avant toute revendication d’alignement actuel.", statusNote: "Référence contextuelle, pas une déclaration que le plan 2021–2025 est encore en vigueur." },
        { name: "Agenda 2063 : Aspirations", publisher: "Union africaine", url: "https://au.int/en/agenda2063/aspirations", relevance: "Croissance inclusive, emplois, compétences, sciences et technologies, autonomisation des jeunes." },
        { name: "Objectifs de développement durable", publisher: "Nations Unies", url: "https://sdgs.un.org/goals", relevance: "Les objectifs les plus pertinents sont les ODD 4, 8, 9, 10 et 17." },
        { name: "Cadre de coopération ONU–Cameroun 2022–2026", publisher: "Nations Unies au Cameroun", url: "https://cameroon.un.org/en/166184-united-nations-sustainable-development-cooperation-framework-cameroon-2022-2026", relevance: "Référence expliquant comment le cycle précédent reliait les ODD, Agenda 2063 et la SND30.", statusNote: "Ce cycle prend fin en 2026 ; consulter la mise à jour de l’ONU sur la préparation du cadre 2027–2031." },
        { name: "Préparation du cadre de coopération 2027–2031", publisher: "Nations Unies au Cameroun", url: "https://cameroon.un.org/en/310788-cameroon-and-united-nations-building-next-cooperation-framework-together", relevance: "Mise à jour de 2026 sur la co-conception du prochain cadre et son lien prévu avec la SND30 et les ODD." },
      ],
      notice: "HCIL est une initiative indépendante. Les références aux cadres publics indiquent uniquement une contribution thématique possible ; elles ne doivent pas être interprétées comme un partenariat, une approbation, une certification ou un soutien officiel.",
    },
    trust: {
      slug: "trust", label: "Confiance et gouvernance", eyebrow: "La confiance dès la conception", title: "L’intelligence doit être traçable, contextuelle et respectueuse des permissions.",
      intro: "Une plateforme de capital humain ne doit pas transformer des inférences incertaines en faits, ni prendre des décisions importantes à partir d’un score caché. HCIL est conçu autour des preuves, de l’autorité explicite et de limites claires sur l’usage des données.",
      sections: [
        { heading: "Les preuves ont une provenance", paragraphs: ["Une preuve de compétence doit préciser ce qui a été évalué ou livré, le contexte concerné, la personne ou le système ayant effectué l’examen, la date et l’état de vérification. Les compétences déclarées, inférées par l’IA, évaluées par une personne et acceptées par un employeur doivent rester distinctes."] },
        { heading: "Mémoire partagée ne signifie pas accès partagé", paragraphs: ["Les agents peuvent réutiliser les connaissances organisationnelles vérifiées entre les sessions, mais l’accès est limité par l’organisation, le rôle, l’objectif et les permissions. Les documents ou relations du graphe d’une entreprise ne doivent jamais être divulgués aux agents d’une autre entreprise."] },
        { heading: "L’IA propose ; les règles et personnes autorisées décident", paragraphs: ["Le modèle peut clarifier une demande, suggérer une décomposition ou expliquer la pertinence d’une preuve. L’affectation, l’acceptation, les changements d’accès et les opérations financières doivent passer par des commandes autorisées, des validations déterministes et une approbation humaine lorsque nécessaire."] },
        { heading: "La personne contrôle le partage professionnel", paragraphs: ["Le futur passeport de compétences et la vérification QR doivent exposer uniquement les informations que la personne choisit de partager, via des liens limités et révocables. Un document confidentiel ne devient pas public simplement parce qu’il a contribué à une évaluation."] },
        { heading: "Apprendre sans exagérer", paragraphs: ["Un travail accepté peut actualiser les preuves pour les compétences précises démontrées. Une seule tâche acceptée ne prouve pas une compétence professionnelle générale, et les données ne doivent pas être transformées en score universel d’employabilité ou d’intelligence."] },
      ],
      notice: "Il s’agit d’engagements de conception pour une plateforme en cours de développement. Les contrôles opérationnels doivent être implémentés et testés avant toute affirmation de sécurité ou de confidentialité en production.",
    },
  },
};

export const ABOUT_SECTIONS: AboutSlug[] = ["mission", "intelligence", "policy-alignment", "trust"];

export function getAboutPage(locale: Locale, slug: AboutSlug): AboutPageData {
  return aboutPages[locale][slug] ?? aboutPages.en.overview;
}

export function getAboutNav(locale: Locale) {
  const data = aboutPages[locale];
  return (["overview", ...ABOUT_SECTIONS] as AboutSlug[]).map((slug) => ({
    slug,
    label: data[slug].label,
    path: slug === "overview" ? "/about" : `/about/${slug}`,
  }));
}
