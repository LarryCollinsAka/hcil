// Shared class strings, so buttons and containers look the same everywhere.

export const container = "mx-auto w-full max-w-6xl px-5 sm:px-8";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold transition duration-200";

export const button = {
  // Dark ink pill: the main call to action on gold surfaces.
  primary: `${buttonBase} bg-green-950 text-gold-100 shadow-[0_12px_30px_-12px_rgba(0,22,17,0.55)] hover:bg-green-800`,
  // Light outline pill: secondary action.
  secondary: `${buttonBase} border border-green-950/20 bg-white/60 text-green-950 hover:border-green-950/40 hover:bg-white`,
  // Gold pill: the main call to action on dark surfaces.
  gold: `${buttonBase} bg-gold-500 text-green-950 shadow-[0_12px_30px_-12px_rgba(252,209,22,0.6)] hover:bg-gold-400`,
  // Outline pill on dark surfaces.
  ghostOnDark: `${buttonBase} border border-gold-100/30 text-gold-100 hover:border-gold-100/60 hover:bg-gold-100/10`,
} as const;

// The tricolour of the flag as a thin divider.
export const tricolor = ["bg-green-600", "bg-red-600", "bg-gold-500"] as const;
