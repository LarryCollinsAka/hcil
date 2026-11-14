"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/site/Icon";
import { button, container } from "@/components/site/ui";
import type { HeroSlide } from "@/content/types";

/** A compact, database-managed public hero. Manual controls avoid forced motion. */
export function HeroSlider({ slides, label }: { slides: HeroSlide[]; label: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (slides.length === 0) return null;
  const slide = slides[activeIndex] ?? slides[0];
  const move = (direction: -1 | 1) =>
    setActiveIndex((current) => (current + direction + slides.length) % slides.length);

  return (
    <section aria-label={label} className={`${container} pt-5 pb-6 sm:pt-8 sm:pb-8`}>
      <div className="relative isolate min-h-[360px] overflow-hidden rounded-[1.75rem] bg-green-950 shadow-[0_24px_70px_-34px_rgba(0,22,17,0.55)] sm:min-h-[410px] lg:min-h-[430px]">
        <div
          role="img"
          aria-label={slide.imageAlt}
          className="absolute inset-0 -z-20 bg-cover bg-center transition-opacity duration-500"
          style={{ backgroundImage: `url("${slide.imageUrl}")` }}
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-green-950/95 via-green-950/75 to-green-950/20" />
        <div className="flex min-h-[360px] items-center px-6 py-12 sm:min-h-[410px] sm:px-12 lg:min-h-[430px] lg:px-16">
          <div className="max-w-2xl text-white" aria-live="polite">
            <p className="inline-flex rounded-full border border-gold-100/40 bg-green-950/35 px-3 py-1.5 text-xs font-semibold tracking-wide text-gold-100 backdrop-blur">
              {slide.eyebrow}
            </p>
            <h1 className="mt-5 max-w-2xl text-balance text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">
              {slide.title}
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/90 sm:text-lg">
              {slide.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={slide.primary.href} className={button.gold}>
                {slide.primary.label}<Icon name="arrow" className="size-4" />
              </Link>
              <Link href={slide.secondary.href} className="inline-flex items-center justify-center rounded-full border border-white/50 bg-white/10 px-6 py-3.5 text-[15px] font-semibold text-white backdrop-blur transition hover:bg-white/20">
                {slide.secondary.label}
              </Link>
            </div>
          </div>
        </div>
        {slides.length > 1 ? (
          <div className="absolute bottom-5 right-5 flex items-center gap-2 sm:bottom-7 sm:right-8">
            <button type="button" aria-label="Previous slide" onClick={() => move(-1)} className="grid size-10 place-items-center rounded-full border border-white/45 bg-green-950/35 text-white backdrop-blur transition hover:bg-green-950/70">
              <Icon name="chevron-left" className="size-5" />
            </button>
            <div className="flex items-center gap-1.5" aria-label={`Slide ${activeIndex + 1} of ${slides.length}`}>
              {slides.map((item, index) => (
                <button key={item.id} type="button" aria-label={`Go to slide ${index + 1}`} aria-current={index === activeIndex ? "true" : undefined} onClick={() => setActiveIndex(index)} className={`h-2.5 rounded-full transition-all ${index === activeIndex ? "w-7 bg-gold-400" : "w-2.5 bg-white/70 hover:bg-white"}`} />
              ))}
            </div>
            <button type="button" aria-label="Next slide" onClick={() => move(1)} className="grid size-10 place-items-center rounded-full border border-white/45 bg-green-950/35 text-white backdrop-blur transition hover:bg-green-950/70">
              <Icon name="chevron-right" className="size-5" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
