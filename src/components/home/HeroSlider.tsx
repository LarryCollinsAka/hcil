"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/site/Icon";
import { button, container } from "@/components/site/ui";
import type { HeroSlide } from "@/content/types";

type Props = {
  slides: HeroSlide[];
  label: string;
  previousLabel: string;
  nextLabel: string;
  slideLabel: string;
  regionLabel: string;
};

/** A calm, editorial hero carousel. It never auto-advances or moves without user input. */
export function HeroSlider({ slides, label, previousLabel, nextLabel, slideLabel, regionLabel }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (slides.length === 0) return null;
  const slide = slides[activeIndex] ?? slides[0];
  const move = (direction: -1 | 1) =>
    setActiveIndex((current) => (current + direction + slides.length) % slides.length);

  return (
    <section aria-label={label} aria-roledescription="carousel" className={`${container} pt-5 pb-8 sm:pt-8 sm:pb-12`}>
      <div className="relative isolate grid min-h-[590px] overflow-hidden rounded-[2rem] bg-green-950 shadow-[0_30px_90px_-38px_rgba(0,22,17,0.48)] sm:min-h-[570px] lg:min-h-[590px] lg:grid-cols-[.94fr_1.06fr]">
        <div
          role="img"
          aria-label={slide.imageAlt}
          className="absolute inset-0 -z-20 bg-cover bg-center lg:left-[40%]"
          style={{ backgroundImage: `url("${slide.imageUrl}")` }}
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-green-950 via-green-950/85 to-green-950/10 lg:bg-gradient-to-r lg:from-green-950 lg:via-green-950/95 lg:to-green-950/5" />

        <div className="relative z-10 flex min-h-[590px] flex-col justify-center px-6 pb-24 pt-16 text-white sm:min-h-[570px] sm:px-10 sm:pb-24 lg:min-h-[590px] lg:px-14 lg:py-16">
          <div className="max-w-[39rem]" aria-live="polite" aria-atomic="true">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/20 bg-green-950/45 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-100 backdrop-blur">
              <span className="size-2 rounded-full bg-gold-400" aria-hidden="true" />
              {regionLabel}
            </div>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.19em] text-gold-300 sm:text-sm">{slide.eyebrow}</p>
            <h1 className="mt-4 max-w-3xl text-balance text-[2.55rem] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-[3.7rem]">
              {slide.title}
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/85 sm:text-lg sm:leading-8">
              {slide.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={slide.primary.href} className={button.gold}>
                {slide.primary.label}<Icon name="arrow" className="size-4" />
              </Link>
              <Link href={slide.secondary.href} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/45 bg-white/10 px-6 py-3.5 text-[15px] font-semibold text-white backdrop-blur transition-colors hover:bg-white/20">
                {slide.secondary.label}
              </Link>
            </div>
          </div>
          <p className="mt-10 text-xs font-medium tracking-wide text-white/65">Cameroon <span className="px-1.5 text-gold-400">/</span> Africa <span className="px-1.5 text-gold-400">/</span> Global</p>
        </div>

        {slides.length > 1 ? (
          <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-green-950/55 p-1.5 backdrop-blur sm:bottom-7 sm:right-8" aria-label={label}>
            <button type="button" aria-label={previousLabel} onClick={() => move(-1)} className="grid size-10 place-items-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300">
              <Icon name="chevron-left" className="size-5" />
            </button>
            <div className="flex items-center gap-1.5 px-1" aria-label={`${slideLabel} ${activeIndex + 1} / ${slides.length}`}>
              {slides.map((item, index) => (
                <button key={item.id} type="button" aria-label={`${slideLabel} ${index + 1}`} aria-current={index === activeIndex ? "true" : undefined} onClick={() => setActiveIndex(index)} className={`h-2.5 rounded-full transition-[width,background-color] ${index === activeIndex ? "w-7 bg-gold-400" : "w-2.5 bg-white/65 hover:bg-white"}`} />
              ))}
            </div>
            <button type="button" aria-label={nextLabel} onClick={() => move(1)} className="grid size-10 place-items-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300">
              <Icon name="chevron-right" className="size-5" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
