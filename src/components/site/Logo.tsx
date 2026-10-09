import Link from "next/link";
import { BRAND } from "@/config/brand";
import { type Locale, href } from "@/lib/i18n";
import { Icon } from "./Icon";

export function Logo({ locale, onDark = false }: { locale: Locale; onDark?: boolean }) {
  return (
    <Link href={href(locale)} className="flex items-center gap-2.5" aria-label={BRAND.name}>
      <span className="grid size-8 place-items-center rounded-full bg-gold-500 text-green-950 ring-1 ring-green-950/10">
        <Icon name="star" className="size-4" />
      </span>
      <span className={`text-[17px] font-semibold tracking-tight ${onDark ? "text-gold-50" : "text-green-950"}`}>
        {BRAND.name}
      </span>
    </Link>
  );
}
