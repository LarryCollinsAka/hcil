import { container } from "@/components/site/ui";
import type { HomeBlock } from "@/content/types";

type Props = Extract<HomeBlock, { type: "highlights" }>["props"];

export function Highlights({ items }: Props) {
  return (
    <section className="bg-gold-500 text-green-950">
      <div className={`${container} grid grid-cols-2 gap-y-10 py-14 lg:grid-cols-4`}>
        {items.map((item, i) => (
          <div key={item.value} className={`px-2 sm:px-6 ${i > 0 ? "lg:border-l lg:border-green-950/15" : ""} ${i % 2 === 1 ? "border-l border-green-950/15 lg:border-l" : ""}`}>
            <p className="text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">{item.value}</p>
            <p className="mt-2 max-w-[16rem] text-sm leading-snug text-green-900">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
