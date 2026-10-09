import Link from "next/link";
import { Icon } from "@/components/site/Icon";
import { button, container } from "@/components/site/ui";
import type { Audience, HomeBlock } from "@/content/types";

type Props = Extract<HomeBlock, { type: "audiences" }>["props"];

function Card({ audience, tone }: { audience: Audience; tone: "gold" | "green" }) {
  const gold = tone === "gold";
  return (
    <article
      className={`flex flex-col rounded-[2rem] p-8 sm:p-10 ${
        gold ? "bg-gold-500 text-green-950" : "bg-green-900 text-gold-50 ring-1 ring-gold-500/20"
      }`}
    >
      <span
        className={`w-fit rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${
          gold ? "bg-green-950/10 text-green-950" : "bg-gold-500/15 text-gold-300"
        }`}
      >
        {audience.tag}
      </span>
      <h3 className="mt-6 text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.025em] sm:text-4xl">{audience.title}</h3>
      <ul className="mt-8 space-y-3.5">
        {audience.items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span
              className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${gold ? "bg-green-950 text-gold-300" : "bg-gold-500 text-green-950"}`}
            >
              <Icon name="check" className="size-3" />
            </span>
            <span className={`leading-snug ${gold ? "text-green-900" : "text-gold-100/85"}`}>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-10 pt-2">
        <Link href={audience.cta.href} className={gold ? button.primary : button.gold}>
          {audience.cta.label}
          <Icon name="arrow" className="size-4" />
        </Link>
      </div>
    </article>
  );
}

export function Audiences({ id, employers, talent }: Props) {
  return (
    <section id={id} className="scroll-mt-24 pb-24 pt-24 sm:pb-28 sm:pt-28">
      <div className={`${container} grid gap-5 lg:grid-cols-2`}>
        <Card audience={employers} tone="gold" />
        <Card audience={talent} tone="green" />
      </div>
    </section>
  );
}
