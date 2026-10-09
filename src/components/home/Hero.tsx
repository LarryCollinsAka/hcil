import Link from "next/link";
import { Icon } from "@/components/site/Icon";
import { button, container } from "@/components/site/ui";
import type { HomeBlock } from "@/content/types";

type HeroProps = Extract<HomeBlock, { type: "hero" }>["props"];

const chip = {
  capability: "bg-gold-100 text-green-900 ring-1 ring-gold-600/30",
  language: "bg-green-100 text-green-800 ring-1 ring-green-600/25",
} as const;

function StepBadge({ n }: { n: number }) {
  return (
    <span className="grid size-6 place-items-center rounded-full bg-green-950 text-[11px] font-semibold text-gold-100">{n}</span>
  );
}

function HeroVisual({ v }: { v: HeroProps["visual"] }) {
  const pct = Math.round(v.confidence * 100);

  return (
    <div className="relative mx-auto mt-16 max-w-5xl sm:mt-20">
      <div className="grid gap-4 md:grid-cols-[1fr_1.35fr_1fr] md:items-start">
        {/* 1. The employer's problem, in their own words */}
        <div className="rounded-3xl border border-green-950/10 bg-white/80 p-5 text-left shadow-[0_30px_80px_-34px_rgba(0,22,17,0.4)] backdrop-blur motion-safe:animate-float-slow md:mt-10">
          <div className="flex items-center gap-2">
            <StepBadge n={1} />
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-green-700">{v.requestLabel}</p>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-green-950">{v.requestText}</p>
        </div>

        {/* 2. Decomposed into packages with requirements */}
        <div className="rounded-3xl border border-green-950/10 bg-white p-5 text-left shadow-[0_36px_90px_-34px_rgba(0,22,17,0.5)] ring-1 ring-gold-500/60">
          <div className="flex items-center gap-2">
            <StepBadge n={2} />
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-green-700">{v.packagesLabel}</p>
          </div>
          <ul className="mt-4 space-y-3">
            {v.packages.map((pkg) => (
              <li key={pkg.title} className="rounded-2xl bg-gold-50 p-3.5 ring-1 ring-green-950/5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-green-950">{pkg.title}</p>
                  {pkg.critical ? <span className="size-2 shrink-0 rounded-full bg-red-600" aria-hidden="true" /> : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {pkg.chips.map((c) => (
                    <span key={c.label} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${chip[c.kind]}`}>
                      {c.label}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. A match with its evidence, and the accepted milestone */}
        <div className="rounded-3xl border border-green-950/10 bg-white/80 p-5 text-left shadow-[0_30px_80px_-34px_rgba(0,22,17,0.4)] backdrop-blur motion-safe:animate-float-slower md:mt-6">
          <div className="flex items-center gap-2">
            <StepBadge n={3} />
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-green-700">{v.matchLabel}</p>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-gold-500 text-sm font-semibold text-green-950">{v.matchInitials}</span>
            <p className="text-sm font-medium text-green-950">{v.matchRole}</p>
          </div>
          <div className="mt-5">
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-medium text-green-800">{v.confidenceLabel}</span>
              <span className="font-semibold text-green-950">{v.confidence.toFixed(2)}</span>
            </div>
            <div
              role="meter"
              aria-label={v.confidenceLabel}
              aria-valuemin={0}
              aria-valuemax={1}
              aria-valuenow={v.confidence}
              className="mt-1.5 h-2 overflow-hidden rounded-full bg-gold-100"
            >
              <div className="h-full rounded-full bg-gold-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-green-600 p-3 text-white">
            <Icon name="check" className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-green-100">{v.milestoneLabel}</p>
              <p className="text-sm font-semibold">{v.milestoneText}</p>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-5 text-center text-xs font-medium text-green-800/70">{v.illustrative}</p>
    </div>
  );
}

export function Hero({ eyebrow, title, subtitle, primary, secondary, note, visual }: HeroProps) {
  return (
    <section className="relative overflow-hidden pb-20 pt-16 text-center sm:pb-28 sm:pt-24">
      {/* Gold glow and a faint dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem] bg-[radial-gradient(60%_55%_at_50%_0%,var(--color-gold-400)_0%,var(--color-gold-200)_38%,transparent_72%)] opacity-80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(rgba(0,22,17,0.1)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
      />

      <div className={container}>
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-green-950/10 bg-white/70 py-1.5 pl-2 pr-4 text-xs font-semibold text-green-900 backdrop-blur sm:text-[13px]">
          <span className="grid size-5 place-items-center rounded-full bg-gold-500 text-green-950">
            <Icon name="star" className="size-3" />
          </span>
          {eyebrow}
        </p>

        <h1 className="mx-auto mt-7 max-w-4xl text-balance text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-6xl lg:text-[4.75rem]">
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-green-800 sm:text-lg">{subtitle}</p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={primary.href} className={button.primary}>
            {primary.label}
            <Icon name="arrow" className="size-4" />
          </Link>
          <Link href={secondary.href} className={button.secondary}>
            {secondary.label}
          </Link>
        </div>
        <p className="mt-5 text-xs font-medium text-green-800/80">{note}</p>

        <HeroVisual v={visual} />
      </div>
    </section>
  );
}
