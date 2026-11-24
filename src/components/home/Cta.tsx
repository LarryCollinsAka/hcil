import Link from "next/link";
import { Icon } from "@/components/site/Icon";
import { button, container, tricolor } from "@/components/site/ui";
import type { HomeBlock } from "@/content/types";

type Props = Extract<HomeBlock, { type: "cta" }>['props'];

export function Cta({ title, text, primary, secondary }: Props) {
  return (
    <section className="pb-20 sm:pb-24">
      <div className={container}>
        <div className="relative overflow-hidden rounded-[2rem] bg-green-950 px-6 pb-16 pt-14 text-center text-white sm:px-12 sm:pt-20">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 size-[28rem] rounded-full border-[52px] border-gold-400/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-44 -left-24 size-[28rem] rounded-full border-[52px] border-white/5" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">The next step starts here</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">{title}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{text}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={primary.href} className={button.gold}>{primary.label}<Icon name="arrow" className="size-4" /></Link>
              <Link href={secondary.href} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-white/10">{secondary.label}</Link>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex h-1.5" aria-hidden="true">{tricolor.map((color) => <div key={color} className={`flex-1 ${color}`} />)}</div>
        </div>
      </div>
    </section>
  );
}
