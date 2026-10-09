import { Icon } from "@/components/site/Icon";
import { container } from "@/components/site/ui";
import type { HomeBlock } from "@/content/types";

type Props = Extract<HomeBlock, { type: "faq" }>["props"];

export function Faq({ id, title, items }: Props) {
  return (
    <section id={id} className="scroll-mt-24 py-24 sm:py-28">
      <div className={`${container} max-w-3xl`}>
        <h2 className="text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-5xl">{title}</h2>

        <div className="mt-10 divide-y divide-green-950/10 border-y border-green-950/10">
          {items.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex list-none items-center justify-between gap-6 text-lg font-medium [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gold-200/70 text-green-950 transition duration-200 group-open:rotate-45 group-open:bg-gold-500">
                  <Icon name="plus" className="size-4" />
                </span>
              </summary>
              <p className="mt-3 max-w-2xl leading-relaxed text-green-800">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
