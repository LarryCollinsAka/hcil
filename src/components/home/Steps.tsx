import { Icon } from "@/components/site/Icon";
import { container } from "@/components/site/ui";
import type { HomeBlock } from "@/content/types";

type Props = Extract<HomeBlock, { type: "steps" }>['props'];

export function Steps({ id, title, subtitle, items }: Props) {
  return (
    <section id={id} className="scroll-mt-24 bg-gold-50 py-20 sm:py-24">
      <div className={container}>
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">A straightforward journey</p>
          <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-green-950 sm:text-5xl">{title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-green-800 sm:text-lg">{subtitle}</p>
        </div>
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((item, i) => (
            <li key={item.title} className="rounded-[1.4rem] border border-green-950/10 bg-white p-5 sm:p-6">
              <span className="grid size-10 place-items-center rounded-full bg-gold-400 text-sm font-bold text-green-950">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-5 text-lg font-semibold leading-snug tracking-tight text-green-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-green-800">{item.text}</p>
              {i < items.length - 1 ? <span className="mt-5 hidden text-green-600 lg:block" aria-hidden="true"><Icon name="arrow" className="size-4" /></span> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
