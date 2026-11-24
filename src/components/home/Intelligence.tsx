import Link from "next/link";
import { Icon } from "@/components/site/Icon";
import { container } from "@/components/site/ui";
import type { HomeBlock } from "@/content/types";

type Props = Extract<HomeBlock, { type: "intelligence" }>['props'];

export function Intelligence({ id, eyebrow, title, subtitle, layers, flowTitle, flow, statusNote, link }: Props) {
  return (
    <section id={id} className="scroll-mt-24 bg-gold-100 py-20 sm:py-24">
      <div className={container}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">{eyebrow}</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <h2 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">{title}</h2>
          <p className="max-w-xl text-base leading-relaxed text-green-900/85 sm:text-lg">{subtitle}</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {layers.map((layer, index) => {
            const icons = ["database", "network", "search", "brain"] as const;
            return (
              <article key={layer.title} className="rounded-[1.5rem] border border-green-950/10 bg-white p-6 sm:p-7">
                <div className={`grid size-11 place-items-center rounded-full ${index === 3 ? "bg-gold-500 text-green-950" : "bg-gold-500 text-green-950"}`}>
                  <Icon name={icons[index]} className="size-5" />
                </div>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-green-700">{layer.tag}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">{layer.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-green-800">{layer.text}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-5 rounded-[1.75rem] bg-green-950 p-6 text-gold-50 sm:p-8">
          <h3 className="text-lg font-semibold">{flowTitle}</h3>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {flow.map((step, i) => (
              <li key={step} className="flex items-start gap-3 rounded-2xl border border-gold-100/15 bg-green-900/60 p-4">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gold-500 text-xs font-bold text-green-950">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm leading-relaxed text-gold-50">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 max-w-4xl text-xs leading-relaxed text-gold-100/65">{statusNote}</p>
          <Link href={link.href} className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-3 text-sm font-semibold text-green-950 transition hover:bg-gold-400">
            {link.label}<Icon name="arrow" className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
