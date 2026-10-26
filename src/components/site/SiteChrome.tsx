"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { SiteCopy } from "@/content/site";
import type { Locale } from "@/lib/i18n";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteChrome({ locale, copy, children }: { locale: Locale; copy: SiteCopy; children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const isWorkspace = pathname.includes(`/${locale}/workspace`);
  return <>
    {!isWorkspace ? <Header locale={locale} copy={copy} /> : null}
    {children}
    {!isWorkspace ? <Footer locale={locale} copy={copy} /> : null}
  </>;
}
