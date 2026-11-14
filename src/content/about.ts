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
      slug: "overview", label: "Overview", eyebrow: "About HCIL", title: "A better way to connect people, skills and work.",
      intro: "HCIL stands for Human Capital Intelligence Lifecycle. We are building it to help organizations explain the work they need done, help people show what they can do, and connect learning with real work over time.",
      sections: [
        { heading: "Why this exists", paragraphs: ["Hiring often begins with job titles, certificates and CVs. Those signals can be useful, but they do not always show whether someone can deliver a particular outcome under the conditions of a specific project.", "HCIL starts with the result an organization needs. It helps make the work clear, identify the skills and languages needed, and understand what a good result should look like."] },
        { heading: "The lifecycle", paragraphs: ["Create a profile → show your skills → identify what to learn → build experience → demonstrate your skills → connect with opportunities → do the work → review results → keep growing. The aim is to support people beyond a single job application or training course."] },
        { heading: "A platform, not an endorsement", paragraphs: ["HCIL is an independent product concept in development. References to public strategies describe areas of potential contribution; they do not imply a partnership, certification, government approval or official endorsement."] },
      ],
    },
    mission: {
      slug: "mission", label: "Mission & approach", eyebrow: "Our mission", title: "Help people show their skills, grow and find meaningful work.",
      intro: "HCIL aims to help people access meaningful work by showing what they can do through practical examples, assessments and experience—not just a job title or certificate.",
      sections: [
        { heading: "Start with outcomes", paragraphs: ["Organizations explain the result they need in their own words. HCIL is being built to help clarify the request, break the work into manageable tasks and agree on what completion means."] },
        { heading: "Match in context", paragraphs: ["The right person depends on the work. HCIL is designed to consider the skills, relevant experience, language needs and practical conditions for each task. Someone may be a good fit for one kind of work and not another; that should not define their overall value."] },
        { heading: "Make room for complementary skills", paragraphs: ["Some projects need more than one person. HCIL may help bring together a small team with complementary skills, while the organization remains in control of its decisions."] },
        { heading: "Turn work into evidence", paragraphs: ["When work is reviewed and accepted, it can become an example of what the person has demonstrated. Completing one task does not automatically prove every other skill they may have."] },
      ],
      principles: [
        { title: "No universal talent score", text: "Capability is multidimensional, evidence-backed and specific to context." },
        { title: "Language skills for real situations", text: "Reading, writing, listening and speaking are considered separately because different tasks need different language skills." },
        { title: "Human accountability", text: "AI can recommend; authorized people and explicit rules govern high-impact actions." },
      ],
    },
    intelligence: {
      slug: "intelligence", label: "How intelligence works", eyebrow: "Organizational intelligence", title: "AI that helps organizations see the bigger picture.",
      intro: "HCIL uses AI to help make sense of information about an organization: its people, teams, projects, plans, skills and results. The goal is to help people find useful information, understand how things connect and decide what to do next. Access to information remains controlled.",
      sections: [
        { heading: "1. One reliable place for important information", paragraphs: ["Important details about organizations, people, projects, agreed tasks and decisions need one reliable record. AI suggestions do not automatically become official decisions or facts."] },
        { heading: "2. Understand how things are connected", paragraphs: ["HCIL is being designed to show how people, teams, projects, documents, decisions and results relate to one another. This can help answer questions that require more than finding a matching word in a document."] },
        { heading: "3. Find useful information faster", paragraphs: ["AI-assisted search should help find relevant information even when people use different words to describe the same thing. Finding a document is not proof that its contents are correct or that a person is qualified."] },
        { heading: "4. AI assistance with clear limits", paragraphs: ["AI assistants may help clarify a request, find approved information, prepare a work plan and support coordination. They should only use information the user is allowed to see, and they should not make important decisions on their own."] },
        { heading: "5. People review important decisions", paragraphs: ["AI can suggest a next step, but authorized people and clear rules must control important actions such as assigning work, approving results, changing access or handling payments. Completed work can add to a person’s record after it has been reviewed."] },
      ],
      notice: "This explains what HCIL is being built toward. Some AI-supported features and work services are still in development and should not be understood as already available.",
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
      slug: "trust", label: "Trust & governance", eyebrow: "Trust by design", title: "People should be able to understand how information is used and who can see it.",
      intro: "A platform that deals with people and work must handle information carefully. HCIL is being designed so that suggestions are not mistaken for facts, important decisions are not made by a hidden score, and personal information is only used for clear purposes.",
      sections: [
        { heading: "Show where information comes from", paragraphs: ["When a skill is assessed or work is completed, the record should explain what was reviewed, when it happened and who reviewed it. Skills people report themselves must be clearly distinguished from skills checked through an assessment or completed work."] },
        { heading: "Private information stays private", paragraphs: ["AI assistants may use approved information to help with ongoing work, but access depends on the person’s organization, role and permissions. One organization must never see another organization’s private information."] },
        { heading: "AI can help, but people remain responsible", paragraphs: ["AI may help explain a request, suggest how to organize work or summarize relevant information. People with the right authority must approve important decisions, including work assignments, completed results, account access and payments."] },
        { heading: "You choose what to share", paragraphs: ["People should be able to choose which parts of their professional profile they share. Private documents must not become public simply because they were used to support an assessment."] },
        { heading: "Be honest about what has been demonstrated", paragraphs: ["Completed work can support the specific skills shown in that task. One successful task does not prove every professional skill, and HCIL should never reduce a person to one employability or intelligence score."] },
      ],
      notice: "These are design commitments for the platform under development. Operational controls must be implemented and tested before HCIL makes production security or privacy claims.",
    },
  },
  fr: {
    overview: {
      slug: "overview", label: "Vue d’ensemble", eyebrow: "À propos de HCIL", title: "Une meilleure façon de relier les personnes, les compétences et le travail.",
      intro: "HCIL signifie « Human Capital Intelligence Lifecycle », ou cycle d’intelligence du capital humain. Nous développons cette plateforme pour aider les organisations à expliquer le travail à réaliser, aider les personnes à montrer leurs compétences et relier l’apprentissage à l’expérience professionnelle.",
      sections: [
        { heading: "Pourquoi cette initiative", paragraphs: ["Le recrutement commence souvent par les intitulés de poste, les diplômes et les CV. Ces signaux peuvent être utiles, mais ne montrent pas toujours si une personne peut obtenir un résultat précis dans les conditions d’un projet donné.", "HCIL part du résultat recherché. La plateforme aide à clarifier le travail, à identifier les compétences et les langues nécessaires et à définir ce qu’est un travail bien réalisé."] },
        { heading: "Le cycle", paragraphs: ["Créer un profil → montrer ses compétences → identifier ce qu’il faut apprendre → acquérir de l’expérience → démontrer ses compétences → accéder à des opportunités → réaliser le travail → examiner les résultats → continuer à progresser. L’objectif est d’accompagner les personnes au-delà d’une candidature ou d’une formation."] },
        { heading: "Une plateforme, pas une approbation officielle", paragraphs: ["HCIL est un concept de produit indépendant en cours de développement. Les références aux stratégies publiques indiquent des domaines de contribution possible ; elles ne signifient ni partenariat, ni certification, ni approbation ou soutien officiel."] },
      ],
    },
    mission: {
      slug: "mission", label: "Mission et approche", eyebrow: "Notre mission", title: "Aider chacun à montrer ses compétences, à progresser et à accéder à un travail utile.",
      intro: "HCIL veut faciliter l’accès à un travail utile en aidant les personnes à montrer ce qu’elles savent faire à travers des exemples pratiques, des évaluations et leur expérience, et pas seulement un titre ou un diplôme.",
      sections: [
        { heading: "Partir du résultat", paragraphs: ["L’organisation décrit son besoin avec ses propres mots. La plateforme doit clarifier le résultat, repérer les informations manquantes et répartir le travail en tâches simples, avec des responsabilités et des délais compréhensibles."] },
        { heading: "Associer en contexte", paragraphs: ["Une compétence prend son sens par rapport au travail. HCIL doit tenir compte des aptitudes recherchées, de l’expérience, des langues nécessaires, de la disponibilité et des conditions pratiques. Une personne peut convenir à une tâche et moins à une autre, sans être réduite à une note générale."] },
        { heading: "Valoriser les compétences complémentaires", paragraphs: ["Lorsqu’une seule personne ne couvre pas toutes les exigences, HCIL peut proposer une petite équipe dont les compétences combinées répondent au besoin. L’organisation examine la proposition et conserve le contrôle des décisions importantes."] },
        { heading: "Transformer le travail en preuve", paragraphs: ["Lorsqu’un travail est examiné et accepté, il peut devenir un exemple des compétences réellement démontrées dans ces conditions. La réussite d’une tâche ne prouve pas automatiquement toutes les autres compétences déclarées."] },
      ],
      principles: [
        { title: "Pas de score de talent universel", text: "Les capacités sont multidimensionnelles, étayées par des preuves et liées au contexte." },
        { title: "Les langues selon les situations", text: "Lire, écrire, écouter et parler sont considérés séparément, car chaque activité demande des aptitudes différentes." },
        { title: "Responsabilité humaine", text: "L’IA peut recommander ; les règles et les personnes autorisées contrôlent les décisions importantes." },
      ],
    },
    intelligence: {
      slug: "intelligence", label: "Fonctionnement de l’intelligence", eyebrow: "Intelligence organisationnelle", title: "Une IA pour mieux comprendre les organisations et leurs activités.",
      intro: "HCIL utilise l’intelligence artificielle pour mieux comprendre les informations d’une organisation : ses personnes, équipes, projets, plans, compétences et résultats. L’objectif est d’aider à trouver les informations utiles, à comprendre les liens et à décider des prochaines étapes. L’accès aux informations reste contrôlé.",
      sections: [
        { heading: "1. Un espace fiable pour les informations importantes", paragraphs: ["Les informations importantes sur les organisations, les personnes, les projets, les tâches convenues et les décisions doivent être conservées dans un espace fiable. Les suggestions de l’IA ne deviennent pas automatiquement des décisions officielles ou des faits."] },
        { heading: "2. Comprendre les liens entre les informations", paragraphs: ["HCIL est conçu pour montrer les liens entre les personnes, les équipes, les projets, les documents, les décisions et les résultats. Cela peut aider à répondre aux questions qui nécessitent davantage que la recherche d’un mot dans un document."] },
        { heading: "3. Retrouver plus facilement les informations utiles", paragraphs: ["La recherche assistée par l’IA doit aider à retrouver des informations utiles même lorsque les personnes utilisent des mots différents pour décrire la même chose. Trouver un document ne prouve pas que son contenu est exact ou qu’une personne est qualifiée."] },
        { heading: "4. Une assistance IA avec des limites claires", paragraphs: ["Les assistants IA pourront aider à clarifier une demande, retrouver des informations autorisées, préparer un plan de travail et faciliter la coordination. Ils ne doivent utiliser que les informations auxquelles la personne a accès et ne doivent pas prendre seuls les décisions importantes."] },
        { heading: "5. Les personnes valident les décisions importantes", paragraphs: ["L’IA peut suggérer une prochaine étape, mais les personnes autorisées et des règles claires doivent contrôler les actions importantes : attribution du travail, validation des résultats, modification des accès ou paiements. Le travail réalisé peut enrichir le profil d’une personne après examen."] },
      ],
      notice: "Cette page présente l’orientation de HCIL. Certaines fonctions d’IA et certains services liés au travail sont encore en développement et ne sont pas présentés comme déjà disponibles.",
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
      slug: "trust", label: "Confiance et gouvernance", eyebrow: "La confiance dès la conception", title: "Chacun doit comprendre comment les informations sont utilisées et qui peut les consulter.",
      intro: "Une plateforme qui traite des personnes et du travail doit gérer les informations avec soin. HCIL est conçu pour que les suggestions ne soient pas confondues avec des faits, que les décisions importantes ne reposent pas sur une note cachée et que les données personnelles soient utilisées dans un but clair.",
      sections: [
        { heading: "Expliquer d’où viennent les informations", paragraphs: ["Lorsqu’une compétence est évaluée ou qu’un travail est réalisé, le dossier doit préciser ce qui a été examiné, à quelle date et par qui. Les compétences déclarées par une personne doivent être distinguées de celles vérifiées par une évaluation ou un travail réalisé."] },
        { heading: "Les informations privées restent privées", paragraphs: ["Les assistants IA peuvent réutiliser des informations autorisées pour aider dans un travail en cours, mais l’accès dépend de l’organisation, du rôle et des autorisations de la personne. Une organisation ne doit jamais consulter les informations privées d’une autre."] },
        { heading: "L’IA aide, les personnes restent responsables", paragraphs: ["L’IA peut expliquer une demande, proposer une organisation du travail ou résumer des informations utiles. Les personnes autorisées doivent approuver les décisions importantes, notamment les affectations, les résultats, les accès aux comptes et les paiements."] },
        { heading: "Vous choisissez ce que vous partagez", paragraphs: ["Chacun doit pouvoir choisir les éléments de son profil professionnel qu’il souhaite partager. Les documents privés ne doivent pas devenir publics simplement parce qu’ils ont servi à une évaluation."] },
        { heading: "Dire clairement ce qui a été démontré", paragraphs: ["Un travail réalisé peut confirmer les compétences précises utilisées pour cette tâche. Une seule réussite ne prouve pas toutes les compétences professionnelles d’une personne, et HCIL ne doit jamais réduire une personne à une note unique d’employabilité ou d’intelligence."] },
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
