import { Icon } from "@/components/site/Icon";
import { container } from "@/components/site/ui";
import type { HomeBlock } from "@/content/types";

type Props = Extract<HomeBlock, { type: "principles" }>["props"];

export function Principles({ id, title, subtitle, items }: Props) {
  return (
    <section id={id} className="relative scroll-mt-24 overflow-hidden bg-green-950 py-24 text-gold-50 sm:py-28">
      <Icon name="star" className="pointer-events-none absolute -right-24 -top-24 size-[30rem] text-gold-500/[0.07]" />
      <div className={`${container} relative`}>
        <h2 className="max-w-2xl text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-5xl">{title}</h2>
        <p className="mt-4 max-w-xl text-lg text-gold-100/75">{subtitle}</p>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <article key={item.title} className="rounded-3xl border border-gold-500/20 bg-green-900/60 p-7 sm:p-8">
              <span className="grid size-11 place-items-center rounded-full bg-gold-500 text-green-950">
                <Icon name={item.icon} className="size-5" />
              </span>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-2.5 leading-relaxed text-gold-100/75">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
