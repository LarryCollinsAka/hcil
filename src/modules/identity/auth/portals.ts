export const AUTH_PORTALS = ["talent", "business", "agency"] as const;
export type AuthPortal = (typeof AUTH_PORTALS)[number];

export function isAuthPortal(value: unknown): value is AuthPortal {
  return typeof value === "string" && (AUTH_PORTALS as readonly string[]).includes(value);
}

export function authPortalPath(locale: string, portal: AuthPortal, mode: "sign-in" | "sign-up") {
  return `/${locale}/${portal}/${mode}`;
}

export const AUTH_PORTAL_COPY = {
  en: {
    talent: {
      label: "Talent",
      title: "Your skills deserve to be seen.",
      description: "Create a talent account to build evidence of what you can do and explore relevant work when opportunities are available.",
      signInTitle: "Welcome back, talent.",
      signInDescription: "Sign in to continue your capability, evidence, and work journey.",
      signUpTitle: "Start with what you can do.",
      signUpDescription: "Start with your own profile. You do not need to submit a CV before creating an account.",
      cta: "Create talent account",
      signInCta: "Sign in as talent",
      name: "Full name",
      orgName: "",
      card: "For job seekers, skilled workers, independent professionals, artisans, tradespeople, and learners.",
      reassurance: "Creating an account does not guarantee tasks, employment, or income.",
    },
    business: {
      label: "Business / Employer",
      title: "Define the work. Find the right capabilities.",
      description: "Create an organization account to clarify work needs, identify required capabilities, and coordinate engagements.",
      signInTitle: "Welcome back, employer.",
      signInDescription: "Sign in to continue managing your organization's work and team access.",
      signUpTitle: "Create an organization account.",
      signUpDescription: "Tell us about your organization. Team access and sensitive permissions are assigned separately.",
      cta: "Create business account",
      signInCta: "Sign in as business",
      name: "Your full name",
      orgName: "Business or organization name",
      card: "For companies, SMEs, NGOs, public institutions, cooperatives, and other organizations.",
      reassurance: "Registration does not publish a job or commit you to hire or pay for a service.",
    },
    agency: {
      label: "Recruitment / Staffing Agency",
      title: "Coordinate talent with clear permissions.",
      description: "Create an agency account to organize staffing and recruitment activity. Representation of a talent requires that person's explicit consent.",
      signInTitle: "Welcome back, agency team.",
      signInDescription: "Sign in to access the agency organization's workspace and assigned permissions.",
      signUpTitle: "Create an agency account.",
      signUpDescription: "Tell us about your agency and its operating model. Registering an agency does not grant rights over any talent.",
      cta: "Create agency account",
      signInCta: "Sign in as agency",
      name: "Your full name",
      orgName: "Agency name",
      card: "For recruitment firms, staffing agencies, and talent-management agencies.",
      reassurance: "Agency membership alone never authorizes representation of a talent.",
    },
  },
  fr: {
    talent: {
      label: "Talent",
      title: "Vos compétences méritent d’être visibles.",
      description: "Créez un compte talent pour constituer des preuves de vos capacités et découvrir des missions pertinentes lorsqu’elles sont disponibles.",
      signInTitle: "Content de vous revoir.",
      signInDescription: "Reprenez votre parcours de compétences, de preuves et de missions.",
      signUpTitle: "Commencez par ce que vous savez faire.",
      signUpDescription: "Commencez par votre profil. Aucun CV n’est nécessaire pour créer un compte.",
      cta: "Créer un compte talent",
      signInCta: "Connexion talent",
      name: "Nom complet",
      orgName: "",
      card: "Pour les chercheurs d’emploi, professionnels indépendants, artisans, travailleurs des métiers et apprenants.",
      reassurance: "La création d’un compte ne garantit ni mission, ni emploi, ni revenu.",
    },
    business: {
      label: "Entreprise / Employeur",
      title: "Définissez le travail. Trouvez les capacités adaptées.",
      description: "Créez un compte organisation pour clarifier les besoins, identifier les compétences nécessaires et coordonner les missions.",
      signInTitle: "Content de vous revoir.",
      signInDescription: "Connectez-vous pour continuer à gérer les activités de votre organisation et les accès de votre équipe.",
      signUpTitle: "Créer un compte organisation.",
      signUpDescription: "Présentez votre organisation. Les accès de l’équipe et les autorisations sensibles sont attribués séparément.",
      cta: "Créer un compte entreprise",
      signInCta: "Connexion entreprise",
      name: "Votre nom complet",
      orgName: "Nom de l’entreprise ou de l’organisation",
      card: "Pour les entreprises, PME, ONG, institutions publiques, coopératives et autres organisations.",
      reassurance: "L’inscription ne publie aucune offre et ne vous engage pas à recruter ou à payer un service.",
    },
    agency: {
      label: "Cabinet / Agence de recrutement",
      title: "Coordonnez les talents avec des autorisations claires.",
      description: "Créez un compte agence pour organiser les activités de recrutement et de placement. La représentation d’un talent nécessite son consentement explicite.",
      signInTitle: "Content de vous revoir.",
      signInDescription: "Connectez-vous pour accéder à l’espace de votre agence et aux autorisations attribuées.",
      signUpTitle: "Créer un compte agence.",
      signUpDescription: "Présentez votre agence et son activité. L’inscription ne donne aucun droit sur les talents.",
      cta: "Créer un compte agence",
      signInCta: "Connexion agence",
      name: "Votre nom complet",
      orgName: "Nom de l’agence",
      card: "Pour les cabinets de recrutement, agences d’intérim et agences de gestion des talents.",
      reassurance: "L’appartenance à une agence n’autorise jamais, à elle seule, la représentation d’un talent.",
    },
  },
} as const;
