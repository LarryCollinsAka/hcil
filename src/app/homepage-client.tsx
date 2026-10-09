"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type {
  HomepageBlock,
  HomepageDocument,
  HomepageLocale,
} from "../content/homepage/types";
import "./hcil-homepage.css";

function ArrowUpRight({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 17 17 7M8 7h9v9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 12h15m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckMark() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m5 12 4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span className="brand-mark-green" />
      <span className="brand-mark-red" />
      <span className="brand-mark-yellow" />
    </span>
  );
}

function LocaleSwitcher({
  locale,
  label,
  onChange,
  compact = false,
}: {
  locale: HomepageLocale;
  label: string;
  onChange: (locale: HomepageLocale) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`locale-switcher${compact ? " locale-switcher-compact" : ""}`}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={
          locale === "en" ? "locale-button is-active" : "locale-button"
        }
        aria-pressed={locale === "en"}
        onClick={() => onChange("en")}
      >
        EN
      </button>
      <span aria-hidden="true" className="locale-divider">
        /
      </span>
      <button
        type="button"
        className={
          locale === "fr" ? "locale-button is-active" : "locale-button"
        }
        aria-pressed={locale === "fr"}
        onClick={() => onChange("fr")}
      >
        FR
      </button>
    </div>
  );
}

function LocalizedLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

function renderStepGraphic(
  graphic: "define" | "verify" | "deliver",
  tags?: [string, string, string],
) {
  if (graphic === "define") {
    return (
      <div className="step-graphic graphic-define">
        <div className="mini-sheet">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <span className="graphic-plus">+</span>
      </div>
    );
  }
  if (graphic === "verify") {
    return (
      <div className="step-graphic graphic-verify">
        <div className="skill-pill pill-one">
          <CheckMark /> {tags?.[0] ?? "Capability"}
        </div>
        <div className="skill-pill pill-two">
          <CheckMark /> {tags?.[1] ?? "Language"}
        </div>
        <div className="skill-pill pill-three">
          <CheckMark /> {tags?.[2] ?? "Evidence"}
        </div>
      </div>
    );
  }
  return (
    <div className="step-graphic graphic-deliver">
      <div className="deliver-node node-a">A</div>
      <div className="deliver-node node-b">B</div>
      <div className="deliver-node node-c">C</div>
      <span className="deliver-line line-a" />
      <span className="deliver-line line-b" />
      <div className="deliver-core">
        <CheckMark />
      </div>
    </div>
  );
}

function renderBlock(
  block: HomepageBlock,
  locale: HomepageLocale,
  setLocale: (locale: HomepageLocale) => void,
  year: number,
) {
  switch (block.type) {
    case "announcement": {
      const p = block.props;
      return (
        <div className="announcement-bar" key={block.type}>
          <span className="announcement-dot" />
          <span>{p.message}</span>
          <a href={p.linkHref} className="announcement-link">
            {p.linkLabel} <ArrowRight size={13} />
          </a>
        </div>
      );
    }
    case "navigation": {
      const p = block.props;
      return (
        <header className="site-header" key={block.type}>
          <Link className="brand" href="#top" aria-label={p.homeLabel}>
            <BrandMark />
            <span className="brand-word">
              HCIL<span className="brand-period">.</span>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label={p.homeLabel}>
            {p.links.map((item) => (
              <a href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <LocaleSwitcher
              locale={locale}
              label={p.localeLabel}
              onChange={setLocale}
            />
            <Link href="/login" className="login-link">
              {p.loginLabel}
            </Link>
            <Link href="/signup" className="button button-dark button-small">
              {p.startLabel} <ArrowUpRight size={15} />
            </Link>
          </div>
          <details className="mobile-menu">
            <summary
              aria-label={
                locale === "fr" ? "Ouvrir la navigation" : "Open navigation"
              }
            >
              <span />
              <span />
              <span />
            </summary>
            <nav aria-label={p.homeLabel}>
              {p.links.map((item) => (
                <a href={item.href} key={item.href}>
                  {item.label}
                </a>
              ))}
              <Link href="/login">{p.loginLabel}</Link>
              <Link href="/signup">{p.startLabel}</Link>
              <LocaleSwitcher
                locale={locale}
                label={p.localeLabel}
                onChange={setLocale}
                compact
              />
            </nav>
          </details>
        </header>
      );
    }
    case "hero": {
      const p = block.props;
      return (
        <section className="hero" id="top" key={block.type}>
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" /> {p.eyebrow}
            </div>
            <h1>
              {p.titleBefore} <span>{p.titleAccent}</span>
            </h1>
            <p className="hero-description">{p.description}</p>
            <div className="hero-actions">
              <Link href="/signup?mode=talent" className="button button-dark">
                {p.talentCta} <ArrowUpRight size={17} />
              </Link>
              <Link
                href="/signup?mode=organization"
                className="button button-outline"
              >
                {p.organizationCta} <ArrowRight size={17} />
              </Link>
            </div>
            <div className="hero-proof-row">
              <div className="proof-icon">
                <CheckMark />
              </div>
              <p>
                <strong>{p.proofTitle}</strong> {p.proofBody}
              </p>
            </div>
          </div>
          <div className="hero-visual" aria-label={p.previewAriaLabel}>
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />
            <div className="work-card">
              <div className="work-card-topline">
                <span className="live-label">
                  <span /> {p.previewLabel}
                </span>
                <span className="card-menu" aria-hidden="true">
                  ···
                </span>
              </div>
              <div className="work-card-heading">
                <div>
                  <p className="tiny-label">{p.categoryLabel}</p>
                  <h2>{p.workTitle}</h2>
                </div>
                <div className="work-symbol" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <p className="work-card-description">{p.workDescription}</p>
              <div className="work-stats">
                <div>
                  <span>{p.timelineLabel}</span>
                  <strong>{p.timelineValue}</strong>
                </div>
                <div>
                  <span>{p.packagesLabel}</span>
                  <strong>{p.packagesValue}</strong>
                </div>
                <div>
                  <span>{p.teamLabel}</span>
                  <strong>{p.teamValue}</strong>
                </div>
              </div>
              <div className="work-divider" />
              <div className="work-units-header">
                <span>{p.breakdownLabel}</span>
                <span>{p.budgetLabel}</span>
              </div>
              <div className="work-units">
                {p.workUnits.map((unit) => (
                  <div className="work-unit" key={unit.number}>
                    <span className={`unit-number unit-${unit.tone}`}>
                      {unit.number}
                    </span>
                    <div className="unit-copy">
                      <strong>{unit.title}</strong>
                      <span>{unit.capability}</span>
                    </div>
                    <strong className="unit-amount">{unit.amount}</strong>
                  </div>
                ))}
              </div>
              <div className="work-card-footer">
                <span className="footer-check">
                  <CheckMark />
                </span>
                <span>{p.footerNote}</span>
              </div>
            </div>
            <div className="floating-note note-top">
              <span className="note-spark">✳</span>
              <span>
                <strong>{p.floatingTitle}</strong>
                <small>{p.floatingBody}</small>
              </span>
            </div>
            <div className="floating-note note-bottom">
              <span className="note-check">
                <CheckMark />
              </span>
              <span>
                <strong>{p.floatingSecondTitle}</strong>
                <small>{p.floatingSecondBody}</small>
              </span>
            </div>
            <div className="visual-caption">
              {p.caption} <span>↗</span>
            </div>
          </div>
        </section>
      );
    }
    case "principles": {
      const p = block.props;
      return (
        <section
          className="signal-strip"
          aria-label={p.ariaLabel}
          key={block.type}
        >
          <div className="signal-intro">{p.intro}</div>
          {p.items.map((item) => (
            <div className="signal-item" key={item.number}>
              <span className="signal-number">{item.number}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </section>
      );
    }
    case "work_model": {
      const p = block.props;
      return (
        <section
          className="section work-model"
          id="how-it-works"
          key={block.type}
        >
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" /> {p.eyebrow}
              </div>
              <h2>
                {p.titleBefore}
                <br />
                <span>{p.titleAccent}</span>
              </h2>
            </div>
            <p>{p.description}</p>
          </div>
          <div className="steps-grid">
            {p.steps.map((step) => (
              <article className="step-card" key={step.index}>
                <span className="step-index">{step.index}</span>
                {renderStepGraphic(step.graphic, step.tags)}
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>
      );
    }
    case "audience_panels": {
      const p = block.props;
      return (
        <section className="section split-section" key={block.type}>
          <article className="audience-panel audience-talent" id="for-talent">
            <div className="panel-top">
              <span className="panel-kicker">{p.talent.eyebrow}</span>
              <span className="panel-arrow">
                <ArrowUpRight />
              </span>
            </div>
            <h2>
              {p.talent.titleBefore}
              <br />
              <span>{p.talent.titleAccent}</span>
            </h2>
            <p>{p.talent.description}</p>
            <ul className="benefit-list">
              {p.talent.benefits.map((benefit) => (
                <li key={benefit}>
                  <span>
                    <CheckMark />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
            <Link href="/signup?mode=talent" className="text-link">
              {p.talent.cta} <ArrowRight />
            </Link>
            <div
              className="panel-decoration talent-decoration"
              aria-hidden="true"
            >
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </article>
          <article
            className="audience-panel audience-org"
            id="for-organizations"
          >
            <div className="panel-top">
              <span className="panel-kicker">{p.organization.eyebrow}</span>
              <span className="panel-arrow">
                <ArrowUpRight />
              </span>
            </div>
            <h2>
              {p.organization.titleBefore}
              <br />
              <span>{p.organization.titleAccent}</span>
            </h2>
            <p>{p.organization.description}</p>
            <ul className="benefit-list">
              {p.organization.benefits.map((benefit) => (
                <li key={benefit}>
                  <span>
                    <CheckMark />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
            <Link href="/signup?mode=organization" className="text-link">
              {p.organization.cta} <ArrowRight />
            </Link>
            <div className="panel-decoration org-decoration" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
          </article>
        </section>
      );
    }
    case "capability_passport": {
      const p = block.props;
      return (
        <section
          className="section capability-section"
          id="capability-passport"
          key={block.type}
        >
          <div className="capability-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" /> {p.eyebrow}
            </div>
            <h2>
              {p.titleBefore} <span>{p.titleAccent}</span>
            </h2>
            <p>{p.description}</p>
            <div className="capability-tags">
              {p.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <Link href="/signup?mode=talent" className="text-link">
              {p.cta} <ArrowRight />
            </Link>
          </div>
          <div className="passport-card">
            <div className="passport-top">
              <div className="passport-brand">
                <BrandMark />
                <span>{p.passportLabel}</span>
              </div>
              <span className="passport-status">
                <span /> {p.evidenceLabel}
              </span>
            </div>
            <div className="passport-person">
              <div className="passport-avatar">AM</div>
              <div>
                <span className="tiny-label">{p.sampleLabel}</span>
                <h3>{p.sampleName}</h3>
                <p>{p.sampleRole}</p>
              </div>
              <div className="passport-globe" aria-hidden="true">
                ◎
              </div>
            </div>
            <div className="passport-divider" />
            <div className="passport-section-title">
              <span>{p.capabilityColumn}</span>
              <span>{p.levelColumn}</span>
            </div>
            {p.skills.map((skill) => (
              <div className="passport-skill" key={skill.name}>
                <div>
                  <strong>{skill.name}</strong>
                  <small>{skill.evidence}</small>
                </div>
                <span className={`level level-${skill.tone}`}>
                  {skill.level}
                </span>
              </div>
            ))}
            <div className="passport-bottom">
              <span>
                <span className="passport-check">
                  <CheckMark />
                </span>{" "}
                {p.permissionNote}
              </span>
              <span className="passport-qr" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
            </div>
            <p className="passport-disclaimer">{p.disclaimer}</p>
          </div>
        </section>
      );
    }
    case "closing_cta": {
      const p = block.props;
      return (
        <section className="closing-cta" id="get-started" key={block.type}>
          <div className="cta-decoration" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="eyebrow eyebrow-light">
            <span className="eyebrow-line" /> {p.eyebrow}
          </div>
          <h2>
            {p.titleBefore}
            <br />
            <span>{p.titleAccent}</span>
          </h2>
          <p>{p.description}</p>
          <div className="hero-actions cta-actions">
            <Link href="/signup?mode=talent" className="button button-yellow">
              {p.talentCta} <ArrowUpRight size={17} />
            </Link>
            <Link
              href="/signup?mode=organization"
              className="button button-green-outline"
            >
              {p.organizationCta} <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      );
    }
    case "footer": {
      const p = block.props;
      return (
        <footer className="site-footer" key={block.type}>
          <Link
            className="brand footer-brand"
            href="#top"
            aria-label={`${p.copyrightBrand} home`}
          >
            <BrandMark />
            <span className="brand-word">
              HCIL<span className="brand-period">.</span>
            </span>
          </Link>
          <p>{p.tagline}</p>
          <div className="footer-links">
            {p.links.map((item) => (
              <LocalizedLink href={item.href} key={item.href}>
                {item.label}
              </LocalizedLink>
            ))}
          </div>
          <span className="footer-copyright">
            © {year} {p.copyrightBrand}
          </span>
        </footer>
      );
    }
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

export default function HomepageClient({
  documents,
}: {
  documents: Record<HomepageLocale, HomepageDocument>;
}) {
  const [locale, setLocale] = useState<HomepageLocale>("en");
  const document = documents[locale] ?? documents.en;
  const year = new Date().getFullYear();

  return (
    <main className="hcil-home" lang={locale}>
      {document.blocks.map((block) =>
        renderBlock(block, locale, setLocale, year),
      )}
    </main>
  );
}
