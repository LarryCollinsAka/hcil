import Link from "next/link";
import { Icon } from "@/components/site/Icon";
import { container } from "@/components/site/ui";
import type { HomeBlock } from "@/content/types";

type Props = Extract<HomeBlock, { type: "journal" }>['props'];

export function Journal({ id, eyebrow, title, subtitle, items, link, readLabel, previewNote }: Props) {
  return (
    <section id={id} className="scroll-mt-24 bg-gold-50 py-24 sm:py-28">
      <div className={container}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">{eyebrow}</p>
            <h2 className="mt-4 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">{title}</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-green-900/80 sm:text-lg">{subtitle}</p>
          </div>
          <Link href={link.href} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-green-950/20 bg-white/60 px-5 py-3 text-sm font-semibold text-green-950 transition hover:bg-gold-200/70">{link.label}<Icon name="arrow" className="size-4"/></Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map((item, index) => (
            <article key={item.slug} className={`flex h-full flex-col rounded-3xl border border-green-950/10 p-6 sm:p-7 ${index === 1 ? "bg-gold-200/55" : "bg-white/60"}`}>
              <span className="w-fit rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-green-950">{item.category}</span>
              <h3 className="mt-5 text-xl font-semibold leading-tight tracking-tight">{item.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-green-900/80">{item.excerpt}</p>
              <Link href={item.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:text-green-950">{readLabel}<Icon name="arrow" className="size-4"/></Link>
            </article>
          ))}
        </div>
        <p className="mt-5 text-xs leading-relaxed text-green-900/60">{previewNote}</p>
      </div>
    </section>
  );
}
