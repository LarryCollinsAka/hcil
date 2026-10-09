import { container } from "@/components/site/ui";
import type { HomeBlock } from "@/content/types";

type Props = Extract<HomeBlock, { type: "steps" }>["props"];

export function Steps({ id, title, subtitle, items }: Props) {
  return (
    <section id={id} className="scroll-mt-24 py-24 sm:py-28">
      <div className={container}>
        <h2 className="max-w-2xl text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-5xl">{title}</h2>
        <p className="mt-4 max-w-xl text-lg text-green-800">{subtitle}</p>

        <ol className="mt-14 grid gap-x-6 gap-y-10 md:grid-cols-5">
          {items.map((item, i) => (
            <li key={item.title} className="relative border-t-2 border-green-950/15 pt-6">
              <span className="absolute -top-[7px] left-0 size-3 rounded-full bg-gold-500 ring-4 ring-gold-50" aria-hidden="true" />
              <p className="text-sm font-semibold text-gold-700">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-green-800">{item.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
