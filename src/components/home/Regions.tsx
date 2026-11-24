import { container } from "@/components/site/ui";
import type { HomeBlock } from "@/content/types";

type Props = Extract<HomeBlock, { type: "regions" }>['props'];

export function Regions({ eyebrow, title, subtitle, items }: Props) {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className={container}>
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">{eyebrow}</p>
          <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-green-950 sm:text-5xl">{title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-green-800 sm:text-lg">{subtitle}</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map((item, index) => (
            <article key={item.title} className="group overflow-hidden rounded-[1.65rem] border border-green-950/10 bg-gold-50">
              <div role="img" aria-label={item.imageAlt} className="h-52 bg-cover bg-center transition-transform duration-500 motion-safe:group-hover:scale-[1.025]" style={{ backgroundImage: `url("${item.imageUrl}")` }} />
              <div className="p-6 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">{item.kicker}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-green-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-green-800">{item.text}</p>
                <span className="mt-5 block h-1 w-12 rounded-full bg-gold-500" aria-hidden="true" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
