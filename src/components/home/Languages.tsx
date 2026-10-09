import { container } from "@/components/site/ui";
import type { HomeBlock } from "@/content/types";

type Props = Extract<HomeBlock, { type: "languages" }>["props"];

export function Languages({ title, subtitle, live, soonLabel, soon }: Props) {
  return (
    <section className="bg-gold-100 py-20 text-center sm:py-24">
      <div className={container}>
        <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.03em] sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-green-800">{subtitle}</p>

        <ul className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {live.map((name) => (
            <li key={name} className="rounded-full bg-gold-500 px-6 py-3 text-lg font-semibold text-green-950 shadow-[0_10px_26px_-12px_rgba(0,22,17,0.45)]">
              {name}
            </li>
          ))}
        </ul>

        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.14em] text-green-700">{soonLabel}</p>
        <ul className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          {soon.map((name) => (
            <li key={name} className="rounded-full border border-dashed border-green-950/30 px-4 py-2 text-sm font-medium text-green-900">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
