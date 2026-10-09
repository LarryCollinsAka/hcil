import Link from "next/link";
import { Icon } from "@/components/site/Icon";
import { button, container, tricolor } from "@/components/site/ui";
import type { HomeBlock } from "@/content/types";

type Props = Extract<HomeBlock, { type: "cta" }>["props"];

export function Cta({ title, text, primary, secondary }: Props) {
  return (
    <section className="pb-24 sm:pb-28">
      <div className={container}>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gold-500 px-7 pb-20 pt-16 text-center sm:px-14 sm:pt-20">
          <Icon name="star" className="pointer-events-none absolute -left-16 -top-16 size-72 rotate-[-12deg] text-gold-300/60" />
          <Icon name="star" className="pointer-events-none absolute -bottom-24 -right-14 size-80 rotate-[14deg] text-gold-400/70" />

          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance text-4xl font-semibold leading-[1.06] tracking-[-0.035em] sm:text-6xl">{title}</h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-green-900">{text}</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={primary.href} className={button.primary}>
                {primary.label}
                <Icon name="arrow" className="size-4" />
              </Link>
              <Link href={secondary.href} className={button.secondary}>
                {secondary.label}
              </Link>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex h-2.5" aria-hidden="true">
            {tricolor.map((color) => (
              <div key={color} className={`flex-1 ${color}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
