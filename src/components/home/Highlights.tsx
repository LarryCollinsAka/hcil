import { container } from "@/components/site/ui";
import type { HomeBlock } from "@/content/types";

type Props = Extract<HomeBlock, { type: "highlights" }>["props"];

/** Four product commitments. Avoid unverified adoption or performance statistics. */
export function Highlights({ ariaLabel, items }: Props) {
  return (
    <section aria-label={ariaLabel} className="bg-gold-500 text-green-950">
      <div className={`${container} grid grid-cols-1 gap-0 py-5 sm:grid-cols-2 lg:grid-cols-4 lg:py-8`}>
        {items.map((item, i) => (
          <article
            key={item.title}
            className={`relative px-4 py-5 sm:px-6 ${i > 0 ? "border-t border-green-950/15 sm:border-t-0" : ""} ${i % 2 === 1 ? "sm:border-l sm:border-green-950/15" : ""} ${i > 1 ? "lg:border-l lg:border-green-950/15" : ""}`}
          >
            <span className="mb-3 block size-2 rounded-full bg-green-950" aria-hidden="true" />
            <h2 className="text-xl font-semibold leading-tight tracking-[-0.025em] sm:text-2xl">{item.title}</h2>
            <p className="mt-2 max-w-[18rem] text-sm leading-relaxed text-green-900">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
