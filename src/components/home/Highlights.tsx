import { container } from "@/components/site/ui";
import type { HomeBlock } from "@/content/types";

type Props = Extract<HomeBlock, { type: "highlights" }>['props'];

/** A concise statement of the experience HCIL is being designed to create. */
export function Highlights({ ariaLabel, items }: Props) {
  return (
    <section aria-label={ariaLabel} className="border-y border-green-950/10 bg-white">
      <div className={`${container} grid grid-cols-1 divide-y divide-green-950/10 py-3 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:py-5`}>
        {items.map((item, i) => (
          <article key={item.title} className={`px-3 py-5 sm:px-5 ${i % 2 === 1 ? "sm:border-l sm:border-green-950/10" : ""} ${i > 1 ? "lg:border-l lg:border-green-950/10" : ""}`}>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-green-600">0{i + 1}</p>
            <h2 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-green-950">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-green-800">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
