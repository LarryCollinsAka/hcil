import Link from "next/link";
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

const workUnits = [
  {
    number: "01",
    title: "Clean the sales data",
    capability: "Excel · Data cleaning",
    amount: "$80",
    tone: "green",
  },
  {
    number: "02",
    title: "Find useful patterns",
    capability: "Analysis · Business reasoning",
    amount: "$120",
    tone: "red",
  },
  {
    number: "03",
    title: "Build the dashboard",
    capability: "Visualisation · Reporting",
    amount: "$100",
    tone: "yellow",
  },
];

const capabilityTags = [
  "Data cleaning",
  "Financial reporting",
  "Customer support",
  "French ↔ English",
  "Web development",
  "Research & analysis",
];

export default function HomePage() {
  return (
    <main className="hcil-home">
      <div className="announcement-bar">
        <span className="announcement-dot" />
        <span>Built around demonstrated capability, not just a résumé.</span>
        <a href="#how-it-works" className="announcement-link">
          See how it works <ArrowRight size={13} />
        </a>
      </div>

      <header className="site-header">
        <Link className="brand" href="#top" aria-label="HCIL home">
          <BrandMark />
          <span className="brand-word">
            HCIL<span className="brand-period">.</span>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#for-talent">For talent</a>
          <a href="#for-organizations">For organizations</a>
          <a href="#capability-passport">Capability passport</a>
        </nav>

        <div className="header-actions">
          <Link href="/login" className="login-link">
            Log in
          </Link>
          <Link href="/signup" className="button button-dark button-small">
            Get started <ArrowUpRight size={15} />
          </Link>
        </div>

        <details className="mobile-menu">
          <summary aria-label="Open navigation">
            <span />
            <span />
            <span />
          </summary>
          <nav aria-label="Mobile navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#for-talent">For talent</a>
            <a href="#for-organizations">For organizations</a>
            <a href="#capability-passport">Capability passport</a>
            <Link href="/login">Log in</Link>
            <Link href="/signup">Get started</Link>
          </nav>
        </details>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" /> HUMAN CAPITAL, PUT TO WORK
          </div>
          <h1>
            Good work starts with <span>what you can do.</span>
          </h1>
          <p className="hero-description">
            HCIL connects real work to proven capabilities. Break projects into
            clear deliverables, bring the right people together, and reward
            accepted work—not just job titles.
          </p>

          <div className="hero-actions">
            <Link href="/signup?mode=talent" className="button button-dark">
              Show what you can do <ArrowUpRight size={17} />
            </Link>
            <Link
              href="/signup?mode=organization"
              className="button button-outline"
            >
              I have work to get done <ArrowRight size={17} />
            </Link>
          </div>

          <div className="hero-proof-row">
            <div className="proof-icon">
              <CheckMark />
            </div>
            <p>
              <strong>Skills with evidence.</strong> Work with clear outcomes. A
              profile that grows with you.
            </p>
          </div>
        </div>

        <div
          className="hero-visual"
          aria-label="Illustrative work package preview"
        >
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="work-card">
            <div className="work-card-topline">
              <span className="live-label">
                <span /> EXAMPLE WORK PACKAGE
              </span>
              <span className="card-menu" aria-hidden="true">
                ···
              </span>
            </div>
            <div className="work-card-heading">
              <div>
                <p className="tiny-label">BUSINESS OPERATIONS</p>
                <h2>Sales data to clear decisions</h2>
              </div>
              <div className="work-symbol" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            <p className="work-card-description">
              Clean a dataset, identify trends, and deliver a dashboard the team
              can use.
            </p>
            <div className="work-stats">
              <div>
                <span>Timeline</span>
                <strong>5 days</strong>
              </div>
              <div>
                <span>Work units</span>
                <strong>3 deliverables</strong>
              </div>
              <div>
                <span>Team</span>
                <strong>2–3 people</strong>
              </div>
            </div>
            <div className="work-divider" />
            <div className="work-units-header">
              <span>THE WORK, DECOMPOSED</span>
              <span>Illustrative budget</span>
            </div>
            <div className="work-units">
              {workUnits.map((unit) => (
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
              <span>
                Each deliverable has its own owner and acceptance criteria.
              </span>
            </div>
          </div>
          <div className="floating-note note-top">
            <span className="note-spark">✳</span>
            <span>
              <strong>Capability first</strong>
              <small>Not a one-size-fits-all score</small>
            </span>
          </div>
          <div className="floating-note note-bottom">
            <span className="note-check">
              <CheckMark />
            </span>
            <span>
              <strong>Milestone by milestone</strong>
              <small>Progress you can verify</small>
            </span>
          </div>
          <div className="visual-caption">
            A new way to organize work <span>↗</span>
          </div>
        </div>
      </section>

      <section className="signal-strip" aria-label="HCIL principles">
        <div className="signal-intro">A better way to work together</div>
        <div className="signal-item">
          <span className="signal-number">01</span>
          <span>Prove capability</span>
        </div>
        <div className="signal-item">
          <span className="signal-number">02</span>
          <span>Define the outcome</span>
        </div>
        <div className="signal-item">
          <span className="signal-number">03</span>
          <span>Share the work</span>
        </div>
        <div className="signal-item">
          <span className="signal-number">04</span>
          <span>Measure what matters</span>
        </div>
      </section>

      <section className="section work-model" id="how-it-works">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> A DIFFERENT WORK MODEL
            </div>
            <h2>
              People aren't job titles.
              <br />
              <span>Work isn't one big task.</span>
            </h2>
          </div>
          <p>
            Some people can clean data. Others can analyse it. Others can turn
            it into a story. HCIL helps those capabilities come together around
            a measurable outcome.
          </p>
        </div>

        <div className="steps-grid">
          <article className="step-card">
            <span className="step-index">01 / DEFINE</span>
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
            <h3>Start with the work</h3>
            <p>
              Describe the outcome you need. Break it into packages with clear
              requirements, deadlines and acceptance criteria.
            </p>
          </article>
          <article className="step-card">
            <span className="step-index">02 / VERIFY</span>
            <div className="step-graphic graphic-verify">
              <div className="skill-pill pill-one">
                <CheckMark /> Data cleaning
              </div>
              <div className="skill-pill pill-two">
                <CheckMark /> French writing
              </div>
              <div className="skill-pill pill-three">
                <CheckMark /> Reporting
              </div>
            </div>
            <h3>Match proven capability</h3>
            <p>
              Look beyond broad labels. Use practical evidence, language
              requirements and the specific needs of the task.
            </p>
          </article>
          <article className="step-card">
            <span className="step-index">03 / DELIVER</span>
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
            <h3>Bring the right people together</h3>
            <p>
              One person or a small team. Each contributor owns a defined
              deliverable, and accepted work creates a clear record.
            </p>
          </article>
        </div>
      </section>

      <section className="section split-section">
        <article className="audience-panel audience-talent" id="for-talent">
          <div className="panel-top">
            <span className="panel-kicker">FOR TALENT</span>
            <span className="panel-arrow">
              <ArrowUpRight />
            </span>
          </div>
          <h2>
            Show your ability.
            <br />
            <span>Grow through real work.</span>
          </h2>
          <p>
            Your degree, experience and training matter. So does what you can
            demonstrate today. Build a professional record that grows as you
            learn, deliver and improve.
          </p>
          <ul className="benefit-list">
            <li>
              <span>
                <CheckMark />
              </span>{" "}
              Prove individual capabilities with evidence
            </li>
            <li>
              <span>
                <CheckMark />
              </span>{" "}
              Contribute where your strengths fit
            </li>
            <li>
              <span>
                <CheckMark />
              </span>{" "}
              Build a history of accepted work
            </li>
          </ul>
          <Link href="/signup?mode=talent" className="text-link">
            Create your talent profile <ArrowRight />
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

        <article className="audience-panel audience-org" id="for-organizations">
          <div className="panel-top">
            <span className="panel-kicker">FOR ORGANIZATIONS</span>
            <span className="panel-arrow">
              <ArrowUpRight />
            </span>
          </div>
          <h2>
            Describe the outcome.
            <br />
            <span>Build the right team.</span>
          </h2>
          <p>
            Turn a broad request into clear work packages. See which
            capabilities are required, assign ownership, and assess delivery
            against agreed criteria.
          </p>
          <ul className="benefit-list">
            <li>
              <span>
                <CheckMark />
              </span>{" "}
              Define work before selecting talent
            </li>
            <li>
              <span>
                <CheckMark />
              </span>{" "}
              Combine complementary capabilities
            </li>
            <li>
              <span>
                <CheckMark />
              </span>{" "}
              Track delivery, quality and acceptance
            </li>
          </ul>
          <Link href="/signup?mode=organization" className="text-link">
            Start with a work request <ArrowRight />
          </Link>
          <div className="panel-decoration org-decoration" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </article>
      </section>

      <section className="section capability-section" id="capability-passport">
        <div className="capability-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" /> CAPABILITY, WITH CONTEXT
          </div>
          <h2>
            A profile should show <span>what backs it up.</span>
          </h2>
          <p>
            HCIL treats capabilities as specific, evidence-backed strengths—not
            a single score that attempts to describe a whole person.
          </p>
          <div className="capability-tags">
            {capabilityTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <Link href="/signup?mode=talent" className="text-link">
            Build your capability record <ArrowRight />
          </Link>
        </div>
        <div className="passport-card">
          <div className="passport-top">
            <div className="passport-brand">
              <BrandMark />
              <span>HCIL / CAPABILITY PASSPORT</span>
            </div>
            <span className="passport-status">
              <span /> EVIDENCE-LED
            </span>
          </div>
          <div className="passport-person">
            <div className="passport-avatar">AM</div>
            <div>
              <span className="tiny-label">SAMPLE PROFILE</span>
              <h3>Alex M.</h3>
              <p>Data & business operations</p>
            </div>
            <div className="passport-globe" aria-hidden="true">
              ◎
            </div>
          </div>
          <div className="passport-divider" />
          <div className="passport-section-title">
            <span>CAPABILITY</span>
            <span>DEMONSTRATED LEVEL</span>
          </div>
          <div className="passport-skill">
            <div>
              <strong>Data cleaning</strong>
              <small>Project evidence · updated recently</small>
            </div>
            <span className="level level-advanced">Advanced</span>
          </div>
          <div className="passport-skill">
            <div>
              <strong>Excel formulas</strong>
              <small>Practical assessment</small>
            </div>
            <span className="level level-proficient">Proficient</span>
          </div>
          <div className="passport-skill">
            <div>
              <strong>Business reporting</strong>
              <small>Accepted deliverable</small>
            </div>
            <span className="level level-building">Developing</span>
          </div>
          <div className="passport-bottom">
            <span>
              <span className="passport-check">
                <CheckMark />
              </span>{" "}
              Evidence can be reviewed with permission.
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
          <p className="passport-disclaimer">
            Illustrative interface · verification and sharing controls are
            planned features
          </p>
        </div>
      </section>

      <section className="closing-cta" id="get-started">
        <div className="cta-decoration" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="eyebrow eyebrow-light">
          <span className="eyebrow-line" /> THE HCIL APPROACH
        </div>
        <h2>
          Make capability visible.
          <br />
          <span>Make good work possible.</span>
        </h2>
        <p>
          Start with what needs to be done, who can prove they can do it, and
          what a successful outcome looks like.
        </p>
        <div className="hero-actions cta-actions">
          <Link href="/signup?mode=talent" className="button button-yellow">
            Join as talent <ArrowUpRight size={17} />
          </Link>
          <Link
            href="/signup?mode=organization"
            className="button button-green-outline"
          >
            I'm hiring <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="site-footer">
        <Link className="brand footer-brand" href="#top" aria-label="HCIL home">
          <BrandMark />
          <span className="brand-word">
            HCIL<span className="brand-period">.</span>
          </span>
        </Link>
        <p>Human capability, connected to meaningful work.</p>
        <div className="footer-links">
          <a href="#how-it-works">How it works</a>
          <a href="#for-talent">For talent</a>
          <a href="#for-organizations">For organizations</a>
          <Link href="/login">Log in</Link>
        </div>
        <span className="footer-copyright">
          © {new Date().getFullYear()} HCIL
        </span>
      </footer>
    </main>
  );
}
