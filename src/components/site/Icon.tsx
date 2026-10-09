export type IconName =
  | "star"
  | "arrow"
  | "check"
  | "layers"
  | "languages"
  | "shield"
  | "coins"
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
