import { Icon } from "@/components/site/Icon";
import { container } from "@/components/site/ui";
import type { HomeBlock } from "@/content/types";

type Props = Extract<HomeBlock, { type: "principles" }>['props'];

export function Principles({ id, title, subtitle, items }: Props) {
  return (
    <section id={id} className="relative scroll-mt-24 overflow-hidden bg-white py-20 sm:py-24">
      <div className={`${container} relative`}>
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">What guides our approach</p>
          <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-green-950 sm:text-5xl">{title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-green-800 sm:text-lg">{subtitle}</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {items.map((item, index) => (
            <article key={item.title} className="rounded-[1.5rem] border border-green-950/10 bg-gold-50 p-6 sm:p-8">
              <span className="grid size-11 place-items-center rounded-full bg-gold-400 text-green-950"><Icon name={item.icon} className="size-5" /></span>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-green-600">Principle 0{index + 1}</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-green-950">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-green-800">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
