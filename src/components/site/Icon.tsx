export type IconName =
  | "star"
  | "arrow"
  | "check"
  | "layers"
  | "languages"
  | "shield"
  | "coins"
  | "database"
  | "network"
  | "search"
  | "brain"
  | "file"
  | "users"
  | "book"
  | "shield-check"
  | "plus"
  | "menu"
  | "close";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const base = { viewBox: "0 0 24 24", "aria-hidden": true, focusable: false, className } as const;

  switch (name) {
    case "star": // the star of the Cameroon flag
      return (
        <svg {...base} fill="currentColor">
          <path d="M12 2 14.47 8.6 21.51 8.91 16 13.3 17.88 20.09 12 16.2 6.12 20.09 8 13.3 2.49 8.91 9.53 8.6Z" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...base} {...stroke}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "check":
      return (
        <svg {...base} {...stroke} strokeWidth={2.2}>
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      );
    case "layers":
      return (
        <svg {...base} {...stroke}>
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="m3 13 9 5 9-5" />
        </svg>
      );
    case "languages":
      return (
        <svg {...base} {...stroke}>
          <path d="M4 5h10v7H8l-3 3v-3H4V5Z" />
          <path d="M14 10h6v7h-1v3l-3-3h-5v-3" />
        </svg>
      );
    case "shield":
      return (
        <svg {...base} {...stroke}>
          <path d="m12 3 8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3Z" />
          <path d="m8.5 12 2.5 2.5 4.5-5" />
        </svg>
      );
    case "coins":
      return (
        <svg {...base} {...stroke}>
          <circle cx="9" cy="9" r="5" />
          <path d="M15.2 9.3A5 5 0 1 1 9.3 15.2" />
        </svg>
      );
    case "database":
      return (
        <svg {...base} {...stroke}>
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
          <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
        </svg>
      );
    case "network":
      return (
        <svg {...base} {...stroke}>
          <circle cx="12" cy="5" r="2.5" />
          <circle cx="5" cy="18" r="2.5" />
          <circle cx="19" cy="18" r="2.5" />
          <path d="m10.8 7.2-4.6 8.6M13.2 7.2l4.6 8.6M7.5 18h9" />
        </svg>
      );
    case "search":
      return (
        <svg {...base} {...stroke}>
          <circle cx="10.8" cy="10.8" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
      );
    case "brain":
      return (
        <svg {...base} {...stroke}>
          <path d="M12 5.2a3.4 3.4 0 0 0-6.6-.7A3.7 3.7 0 0 0 4.2 11a3.6 3.6 0 0 0 2.2 6.5A3.5 3.5 0 0 0 12 20V5.2Z" />
          <path d="M12 5.2a3.4 3.4 0 0 1 6.6-.7A3.7 3.7 0 0 1 19.8 11a3.6 3.6 0 0 1-2.2 6.5A3.5 3.5 0 0 1 12 20M8 8.5h2M7 14h3M14 8.5h2M14 14h3" />
        </svg>
      );
    case "file":
      return (
        <svg {...base} {...stroke}>
          <path d="M6 3h8l4 4v14H6z" />
          <path d="M14 3v5h5M9 13h6M9 17h6" />
        </svg>
      );
    case "users":
      return (
        <svg {...base} {...stroke}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20v-1.4A5.5 5.5 0 0 1 9 13h0a5.5 5.5 0 0 1 5.5 5.6V20M16 5.5a3 3 0 0 1 0 5.8M17 13.5a5 5 0 0 1 3.5 4.8V20" />
        </svg>
      );
    case "book":
      return (
        <svg {...base} {...stroke}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z" />
          <path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20M8 7h8M8 11h8" />
        </svg>
      );
    case "shield-check":
      return (
        <svg {...base} {...stroke}>
          <path d="m12 3 8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3Z" />
          <path d="m8 12 2.5 2.5L16 9" />
        </svg>
      );
    case "plus":
      return (
        <svg {...base} {...stroke} strokeWidth={2}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "menu":
      return (
        <svg {...base} {...stroke} strokeWidth={2}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case "close":
      return (
        <svg {...base} {...stroke} strokeWidth={2}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );
  }
}
