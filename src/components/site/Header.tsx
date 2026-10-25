"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { SiteCopy } from "@/content/site";
import { type Locale, href } from "@/lib/i18n";
import { Icon } from "./Icon";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Logo } from "./Logo";

const aboutPaths = [
  { key: "overview", path: "/about" },
  { key: "mission", path: "/about/mission" },
  { key: "intelligence", path: "/about/intelligence" },
  { key: "policy", path: "/about/policy-alignment" },
  { key: "trust", path: "/about/trust" },
] as const;

export function Header({ locale, copy }: { locale: Locale; copy: SiteCopy }) {
  const pathname = usePathname();
  const aboutMenuRef = useRef<HTMLDetailsElement>(null);
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);
  const mobileAboutMenuRef = useRef<HTMLDetailsElement>(null);

  const anchors = [
    { href: href(locale, "#how"), label: copy.nav.how },
    { href: href(locale, "#principles"), label: copy.nav.principles },
    { href: href(locale, "#audiences"), label: copy.nav.audiences },
    { href: href(locale, "#faq"), label: copy.nav.faq },
  ];

  // App Router layouts persist between sibling routes, so native <details> menus
  // do not automatically close when only the page content changes.
  useEffect(() => {
    aboutMenuRef.current?.removeAttribute("open");
    mobileMenuRef.current?.removeAttribute("open");
    mobileAboutMenuRef.current?.removeAttribute("open");
  }, [pathname]);

  function closeMenus() {
    aboutMenuRef.current?.removeAttribute("open");
    mobileMenuRef.current?.removeAttribute("open");
    mobileAboutMenuRef.current?.removeAttribute("open");
  }

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-green-950/10 bg-gold-50/90 py-2 pl-4 pr-2 shadow-[0_10px_34px_-14px_rgba(0,22,17,0.3)] backdrop-blur-xl">
        <Logo locale={locale} />

        <nav aria-label={copy.primaryNav} className="hidden items-center gap-0.5 lg:flex">
          {anchors.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenus}
              className="rounded-full px-3 py-2 text-sm font-medium text-green-900 transition hover:bg-gold-200/60 hover:text-green-950"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={href(locale, "/blog")}
            onClick={closeMenus}
            className="rounded-full px-3 py-2 text-sm font-medium text-green-900 transition hover:bg-gold-200/60 hover:text-green-950"
          >
            {copy.nav.blog}
          </Link>
          <details
            ref={aboutMenuRef}
            className="group relative"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                aboutMenuRef.current?.removeAttribute("open");
              }
            }}
          >
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-green-900 transition hover:bg-gold-200/60 [&::-webkit-details-marker]:hidden">
              {copy.nav.about}
              <span className="text-xs transition group-open:rotate-180">⌄</span>
            </summary>
            <div className="absolute right-0 top-11 w-72 rounded-3xl border border-green-950/10 bg-gold-50 p-2 shadow-[0_24px_60px_-20px_rgba(0,22,17,0.35)]">
              {aboutPaths.map(({ key, path }) => (
                <Link
                  key={key}
                  href={href(locale, path)}
                  onClick={closeMenus}
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-green-950 transition hover:bg-gold-200/60"
                >
                  {copy.aboutMenu[key]}
                </Link>
              ))}
            </div>
          </details>
        </nav>

        <div className="flex items-center gap-1.5">
          <LocaleSwitcher locale={locale} label={copy.footer.language} />
          <Link
            href={href(locale, "/auth/sign-in")}
            onClick={closeMenus}
            className="hidden rounded-full px-3 py-2 text-sm font-semibold text-green-900 transition hover:bg-gold-200/60 sm:inline-block"
          >
            {copy.signIn}
          </Link>
          <Link
            href={href(locale, "/auth/sign-up")}
            onClick={closeMenus}
            className="hidden rounded-full bg-green-950 px-4 py-2 text-sm font-semibold text-gold-100 transition hover:bg-green-800 sm:inline-block"
          >
            {copy.getStarted}
          </Link>
          <details ref={mobileMenuRef} className="group relative lg:hidden">
            <summary
              aria-label={copy.menu}
              className="grid size-10 list-none place-items-center rounded-full bg-gold-200/60 text-green-950 [&::-webkit-details-marker]:hidden"
            >
              <Icon name="menu" className="size-5 group-open:hidden" />
              <Icon name="close" className="hidden size-5 group-open:block" />
            </summary>
            <div className="absolute right-0 top-12 max-h-[80vh] w-72 overflow-y-auto rounded-3xl border border-green-950/10 bg-gold-50 p-2 shadow-[0_24px_60px_-20px_rgba(0,22,17,0.45)]">
              {anchors.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenus}
                  className="block rounded-2xl px-4 py-3 text-[15px] font-medium text-green-950 hover:bg-gold-200/60"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={href(locale, "/blog")}
                onClick={closeMenus}
                className="block rounded-2xl px-4 py-3 text-[15px] font-medium text-green-950 hover:bg-gold-200/60"
              >
                {copy.nav.blog}
              </Link>
              <details ref={mobileAboutMenuRef} className="group/about rounded-2xl">
                <summary className="flex list-none items-center justify-between rounded-2xl px-4 py-3 text-[15px] font-semibold text-green-950 hover:bg-gold-200/60 [&::-webkit-details-marker]:hidden">
                  {copy.nav.about}<span>⌄</span>
                </summary>
                <div className="pb-2 pl-3">
                  {aboutPaths.map(({ key, path }) => (
                    <Link
                      key={key}
                      href={href(locale, path)}
                      onClick={closeMenus}
                      className="block rounded-xl px-4 py-2.5 text-sm text-green-900 hover:bg-gold-200/60"
                    >
                      {copy.aboutMenu[key]}
                    </Link>
                  ))}
                </div>
              </details>
              <div className="mt-1 grid grid-cols-2 gap-2 border-t border-green-950/10 p-2 pt-3">
                <Link
                  href={href(locale, "/auth/sign-in")}
                  onClick={closeMenus}
                  className="block rounded-full border border-green-950/15 px-3 py-2.5 text-center text-sm font-semibold text-green-950"
                >
                  {copy.signIn}
                </Link>
                <Link
                  href={href(locale, "/auth/sign-up")}
                  onClick={closeMenus}
                  className="block rounded-full bg-green-950 px-3 py-2.5 text-center text-sm font-semibold text-gold-100"
                >
                  {copy.getStarted}
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
