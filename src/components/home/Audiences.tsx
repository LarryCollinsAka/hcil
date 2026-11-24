import Link from "next/link";
import { Icon } from "@/components/site/Icon";
import { container } from "@/components/site/ui";
import type { Audience, HomeBlock } from "@/content/types";

type Props = Extract<HomeBlock, { type: "audiences" }>['props'];

function Card({ audience, id, tone }: { audience: Audience; id: string; tone: "gold" | "green" | "white" }) {
  const toneClasses = tone === "gold" ? "bg-gold-100" : tone === "green" ? "bg-green-950 text-white" : "bg-white";
  const textClasses = tone === "green" ? "text-white/80" : "text-green-800";
  const chipClasses = tone === "green" ? "bg-gold-400 text-green-950" : "bg-gold-200 text-green-950";
  return (
    <article id={id} className={`scroll-mt-28 flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-green-950/10 shadow-[0_16px_45px_-34px_rgba(0,22,17,0.4)] ${toneClasses}`}>
      {audience.imageUrl ? <div role="img" aria-label={audience.imageAlt ?? ""} className="h-44 bg-cover bg-center sm:h-48" style={{ backgroundImage: `url("${audience.imageUrl}")` }} /> : null}
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <span className={`w-fit rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.13em] ${chipClasses}`}>{audience.tag}</span>
        <h3 className="mt-5 text-balance text-2xl font-semibold leading-[1.12] tracking-[-0.025em] sm:text-[1.75rem]">{audience.title}</h3>
        <ul className={`mt-6 flex-1 space-y-3 text-sm leading-relaxed ${textClasses}`}>
          {audience.items.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${tone === "green" ? "bg-gold-400 text-green-950" : "bg-green-100 text-green-800"}`}>
                <Icon name="check" className="size-3" />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Link href={audience.cta.href} className={`mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${tone === "green" ? "bg-gold-400 text-green-950 hover:bg-gold-300" : "bg-green-950 text-white hover:bg-green-800"}`}>
          {audience.cta.label}<Icon name="arrow" className="size-4" />
        </Link>
      </div>
    </article>
  );
}

export function Audiences({ id, employers, talent, institutions }: Props) {
  return (
    <section id={id} className="scroll-mt-24 bg-gold-50 py-20 sm:py-24">
      <div className={container}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">Built around people and outcomes</p>
            <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-green-950 sm:text-5xl">One ecosystem. Different ways to move forward.</h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-green-800">Whether you are building your career, delivering work or supporting development, HCIL is being shaped around practical human outcomes.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card id="for-talent" audience={talent} tone="white" />
          <Card id="for-companies" audience={employers} tone="green" />
          <Card id="for-institutions" audience={institutions} tone="gold" />
        </div>
      </div>
    </section>
  );
}
