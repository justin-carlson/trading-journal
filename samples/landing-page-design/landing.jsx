// trading-journal.ai landing page. Deep dark theme, type-first, editorial.
// Sections: nav · hero (animated review-loop walkthrough) · the review loop ·
// local-first/privacy · get started. Uses window.LM (mocks) + journal tokens.

const { useState: uS, useEffect: uE, useRef: uR } = React;
const L = window.LM;
const LFEAT = window.LF;

const DEMO_URL = 'https://trading-journal.ai/demo';
const GH_URL = 'https://github.com/trading-journal-ai/trading-journal';

// ── tiny icon set ────────────────────────────────────────────────
function Icon({ d, size = 16, sw = 1.6, fill }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
}
const IconArrow = <Icon d={<><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>} />;
const IconGit = <Icon size={17} d={<><path d="M9 19c-5 1.5-5-2.5-7-3" /><path d="M15 22v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 19 5.3a4.9 4.9 0 0 0-.1-3.6s-1.1-.3-3.6 1.4a12.3 12.3 0 0 0-6.6 0C6.2 1.4 5.1 1.7 5.1 1.7A4.9 4.9 0 0 0 5 5.3 5.2 5.2 0 0 0 3.7 8.8c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.6V22" /></>} />;

// ── Nav ──────────────────────────────────────────────────────────
function Nav() {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', background: 'rgba(11,13,18,.72)', borderBottom: '1px solid var(--hair)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 9, height: 9, borderRadius: 9, background: 'var(--g)', boxShadow: '0 0 12px var(--g-edge)' }} />
          <span style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>Trading Journal AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          <a href="#review" style={{ fontSize: 13.5, color: 'var(--body)', textDecoration: 'none', fontWeight: 500 }} className="lnk">The review habit</a>
          <a href="#coach" style={{ fontSize: 13.5, color: 'var(--body)', textDecoration: 'none', fontWeight: 500 }} className="lnk">AI coach</a>
          <a href="#local" style={{ fontSize: 13.5, color: 'var(--body)', textDecoration: 'none', fontWeight: 500 }} className="lnk">Local-first</a>
          <a href={GH_URL} style={{ fontSize: 13.5, color: 'var(--body)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 7 }} className="lnk">{IconGit} GitHub</a>
          <a href={DEMO_URL} style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--bg)', background: 'var(--ink)', padding: '9px 17px', borderRadius: 8, textDecoration: 'none' }} className="btn-solid">View the demo</a>
        </div>
      </div>
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────
function Hero() {
  const [i, setI] = uS(0);
  const [paused, setPaused] = uS(false);
  const stages = L.STAGES;
  uE(() => {
    if (paused) return;
    const t = setTimeout(() => setI((x) => (x + 1) % stages.length), 4200);
    return () => clearTimeout(t);
  }, [i, paused, stages.length]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 32px 40px' }}>
      <div style={{ maxWidth: 800 }}>
        <div className="tj-eyebrow" style={{ fontSize: 11.5, marginBottom: 22, color: 'var(--g)' }}>Local-first trading journal</div>
        <h1 style={{ margin: 0, fontSize: 56, lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 600, color: 'var(--ink)', textWrap: 'balance' }}>
          A journal-first trading review system.
        </h1>
        <p style={{ margin: '26px 0 0', fontSize: 19, lineHeight: 1.6, color: 'var(--prose)', maxWidth: 620, textWrap: 'pretty' }}>
          Trading Journal AI is built around the review habit. Write the daily recap, drill into the trades that mattered, and note what to repeat — so the story of each day stays easy to read.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 34 }}>
          <a href={DEMO_URL} className="btn-solid" style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 15, fontWeight: 600, color: 'var(--bg)', background: 'var(--ink)', padding: '13px 22px', borderRadius: 9, textDecoration: 'none' }}>
            View the live demo {IconArrow}
          </a>
          <a href={GH_URL} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 15, fontWeight: 600, color: 'var(--ink)', border: '1px solid var(--border)', padding: '13px 22px', borderRadius: 9, textDecoration: 'none' }}>
            {IconGit} View on GitHub
          </a>
        </div>
        <div style={{ marginTop: 18, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>No signup · No subscription · Your data stays on your machine</div>
      </div>

      {/* Walkthrough — copy static, bar auto-advances */}
      <div style={{ marginTop: 64 }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {/* step rail */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stages.length}, 1fr)`, gap: 14, marginBottom: 22 }}>
          {stages.map((s, idx) => {
            const on = idx === i;
            return (
              <button key={s.key} onClick={() => setI(idx)} style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ height: 2, borderRadius: 2, background: 'var(--border)', overflow: 'hidden', position: 'relative' }}>
                  {on
                    ? <div key={'f' + i} style={{ position: 'absolute', inset: 0, background: 'var(--g)', transformOrigin: 'left', transform: paused ? 'scaleX(1)' : 'scaleX(0)', animation: paused ? 'none' : 'tj-growx 4.2s linear forwards' }} />
                    : <div style={{ position: 'absolute', inset: 0, background: 'var(--g)', transformOrigin: 'left', transform: `scaleX(${idx < i ? 1 : 0})` }} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: on ? 'var(--g)' : 'var(--faint)' }}>{String(idx + 1).padStart(2, '0')}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: on ? 'var(--ink)' : 'var(--muted)' }}>{s.kicker}</span>
                </div>
                <span style={{ fontSize: 12.5, lineHeight: 1.45, color: on ? 'var(--body)' : 'var(--muted)' }}>{s.desc}</span>
              </button>
            );
          })}
        </div>

        {/* frame */}
        <L.BrowserFrame>
          <div style={{ position: 'relative' }}>
            {stages.map((s, idx) => (
              <div key={s.key} style={{ position: idx === i ? 'relative' : 'absolute', inset: 0, opacity: idx === i ? 1 : 0, transition: 'opacity .5s ease', pointerEvents: idx === i ? 'auto' : 'none' }}>
                <L.Stage dw={1000} dh={600}><s.Mock /></L.Stage>
              </div>
            ))}
          </div>
        </L.BrowserFrame>
      </div>
    </div>
  );
}

// ── Value band (product summary) ─────────────────────────────────
function ValueBand() {
  return (
    <div style={{ borderTop: '1px solid var(--hair)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'baseline' }}>
        <h2 style={{ margin: 0, fontSize: 33, lineHeight: 1.14, letterSpacing: '-0.02em', fontWeight: 600, color: 'var(--ink)', textWrap: 'balance' }}>Review faster. Remember more.<br />Refine your process.</h2>
        <p style={{ margin: 0, fontSize: 17.5, lineHeight: 1.62, color: 'var(--prose)', textWrap: 'pretty' }}>
          Trading Journal AI brings notes, charts, P&L, tags, and coaching into one journal-first workflow — so every session compounds into a process you can actually see. Open source, and it runs entirely on your machine.
        </p>
      </div>
    </div>
  );
}

// ── The review habit section (refined, fewer screens) ────────────
function Review() {
  return (
    <div id="review" style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 32px 30px' }}>
      <div style={{ maxWidth: 760, marginBottom: 64 }}>
        <div className="tj-eyebrow" style={{ marginBottom: 18 }}>The review habit</div>
        <h2 style={{ margin: 0, fontSize: 40, lineHeight: 1.08, letterSpacing: '-0.025em', fontWeight: 600, color: 'var(--ink)', textWrap: 'balance' }}>
          Review faster. Remember more.<br /><span style={{ color: 'var(--prose)' }}>Refine your process.</span>
        </h2>
        <p style={{ margin: '22px 0 0', fontSize: 17.5, lineHeight: 1.6, color: 'var(--prose)', maxWidth: 640, textWrap: 'pretty' }}>
          Trading Journal AI brings notes, charts, P&L, tags, and coaching into one journal-first workflow.
        </p>
      </div>

      {/* Feature 1: the day in context */}
      <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 56, alignItems: 'center', paddingBottom: 64 }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--g)', marginBottom: 14 }}>01 · See the day in context</div>
          <h3 style={{ margin: 0, fontSize: 25, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>The recap leads, the data follows.</h3>
          <p style={{ margin: '16px 0 0', fontSize: 16, lineHeight: 1.6, color: 'var(--prose)', textWrap: 'pretty' }}>
            Open a day and the recap sits first — market read, execution, lesson — with the trades and P&L beside it for reference, not as the headline. The week and month are just containers you scroll back through.
          </p>
        </div>
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--surface)', boxShadow: '0 30px 70px -34px rgba(0,0,0,.6)' }}>
          <L.Stage dw={1000} dh={600}><L.MockRecap /></L.Stage>
        </div>
      </div>

      {/* Feature 2: capture it fast (note + pills zoom-in) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 56, alignItems: 'center', borderTop: '1px solid var(--hair)', paddingTop: 64 }}>
        <div style={{ order: 1 }}>
          <L.Stage dw={600} dh={560}><LFEAT.NoteComposerCard /></L.Stage>
        </div>
        <div style={{ order: 2 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--g)', marginBottom: 14 }}>02 · Capture it in seconds</div>
          <h3 style={{ margin: 0, fontSize: 25, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>Tag the trade in your own language.</h3>
          <p style={{ margin: '16px 0 0', fontSize: 16, lineHeight: 1.6, color: 'var(--prose)', textWrap: 'pretty' }}>
            Write a sentence, then tap the pills that fit — one quality call, plus the process and emotion behind it. The same vocabulary every session, so patterns become searchable instead of buried in prose.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 22 }}>
            <LFEAT.Pill label="Best setup" tone="positive" active />
            <LFEAT.Pill label="Patient" tone="positive" active />
            <LFEAT.Pill label="Oversized" tone="negative" />
            <LFEAT.Pill label="FOMO" tone="negative" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AI coach (concept teaser) ────────────────────────────────────
function Coach() {
  return (
    <div id="coach" style={{ borderTop: '1px solid var(--hair)', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <LFEAT.Spark size={15} />
          <div className="tj-eyebrow" style={{ color: 'var(--accent)' }}>The AI in Trading Journal AI</div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 7px' }}>Preview</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: 56, alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 40, lineHeight: 1.08, letterSpacing: '-0.025em', fontWeight: 600, color: 'var(--ink)', textWrap: 'balance' }}>
              A coach that grades against <span style={{ color: 'var(--accent)' }}>your</span> rules.
            </h2>
            <p style={{ margin: '22px 0 0', fontSize: 17, lineHeight: 1.62, color: 'var(--prose)', maxWidth: 520, textWrap: 'pretty' }}>
              First you codify what an A+ trade looks like — the entry, risk, and process criteria you already track as pills. Then the coach reads every imported trade against that standard, flags where you drifted, and drafts the note and recap in your voice.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 30 }}>
              {[
                ['Codify your edge', 'Turn your process pills into the rubric the coach grades by.'],
                ['Review against it', 'Each trade gets read against your own criteria — not generic advice.'],
                ['Draft, never auto-post', 'The coach proposes the note and recap; you always edit before it saves.'],
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 14 }}>
                  <span style={{ flex: '0 0 auto', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)', paddingTop: 2 }}>{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <div style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--ink)' }}>{r[0]}</div>
                    <div style={{ fontSize: 14.5, lineHeight: 1.5, color: 'var(--prose)', marginTop: 3 }}>{r[1]}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 26, fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--faint)' }}>Concept preview — runs on your trades, on your machine.</div>
          </div>
          <div>
            <L.Stage dw={600} dh={420}><LFEAT.CoachConceptCard /></L.Stage>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Local-first / privacy ────────────────────────────────────────
function LocalFirst() {
  const points = [
    { k: 'On your machine', t: 'Everything lives in a local SQLite file in your project folder. Stopping the app never touches your entries.', icon: <Icon size={20} d={<><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></>} /> },
    { k: 'Private by default', t: 'Your broker exports and notes are gitignored. Trade data stays yours unless you intentionally deploy or share it.', icon: <Icon size={20} d={<><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>} /> },
    { k: 'No subscription', t: 'No hosted account, no monthly fee, no signup. Reflection that does not depend on someone else’s server.', icon: <Icon size={20} d={<><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3" /><path d="M12 17h.01" /></>} /> },
    { k: 'Open source · MIT', t: 'Built in the open. Download it, fork it, run it, or use it as the starting point for your own journal.', icon: IconGit },
  ];
  return (
    <div id="local" style={{ borderTop: '1px solid var(--hair)', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '90px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            <div className="tj-eyebrow" style={{ marginBottom: 18, color: 'var(--g)' }}>Local-first</div>
            <h2 style={{ margin: 0, fontSize: 38, lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 600, color: 'var(--ink)', textWrap: 'balance' }}>Your trading day never leaves your machine.</h2>
            <p style={{ margin: '22px 0 0', fontSize: 17, lineHeight: 1.62, color: 'var(--prose)', textWrap: 'pretty' }}>
              It’s the first thing serious traders ask about — and the answer is simple. A trading journal holds some of your most sensitive records: account history, positions, timestamps. Trading Journal AI is a personal tool, not a hosted service. It runs locally and stores everything on disk, so your review habit stays completely private.
            </p>
            <a href={GH_URL} className="lnk" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginTop: 28, fontSize: 15, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
              Read how it works {IconArrow}
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--hair)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            {points.map((p) => (
              <div key={p.k} style={{ background: 'var(--bg)', padding: '26px 24px' }}>
                <span style={{ color: 'var(--g)' }}>{p.icon}</span>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', margin: '15px 0 8px' }}>{p.k}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--prose)', textWrap: 'pretty' }}>{p.t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Get started ──────────────────────────────────────────────────
function GetStarted() {
  const [copied, setCopied] = uS(false);
  const cmd = 'git clone https://github.com/trading-journal-ai/trading-journal.git';
  const copy = () => {
    navigator.clipboard?.writeText(cmd + '\ncd trading-journal\n./install-trading-journal.sh');
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div style={{ borderTop: '1px solid var(--hair)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 32px', textAlign: 'center' }}>
        <div className="tj-eyebrow" style={{ marginBottom: 20 }}>Get started</div>
        <h2 style={{ margin: 0, fontSize: 42, lineHeight: 1.08, letterSpacing: '-0.025em', fontWeight: 600, color: 'var(--ink)', textWrap: 'balance' }}>Try the demo, or run your own in two minutes.</h2>
        <p style={{ margin: '22px auto 0', fontSize: 17, lineHeight: 1.6, color: 'var(--prose)', maxWidth: 560, textWrap: 'pretty' }}>
          Explore the hosted demo with seeded trades and journal notes, or clone the repo and start a private local journal with your own broker CSV.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 36, flexWrap: 'wrap' }}>
          <a href={DEMO_URL} className="btn-solid" style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 15, fontWeight: 600, color: 'var(--bg)', background: 'var(--ink)', padding: '13px 24px', borderRadius: 9, textDecoration: 'none' }}>View the live demo {IconArrow}</a>
          <a href={GH_URL} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 15, fontWeight: 600, color: 'var(--ink)', border: '1px solid var(--border)', padding: '13px 24px', borderRadius: 9, textDecoration: 'none' }}>{IconGit} Star on GitHub</a>
        </div>
        {/* install command */}
        <div style={{ marginTop: 40, maxWidth: 620, margin: '40px auto 0', textAlign: 'left' }}>
          <div className="tj-eyebrow" style={{ marginBottom: 11, textAlign: 'center' }}>Or run it locally</div>
          <button onClick={copy} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9, padding: '15px 18px', cursor: 'pointer', textAlign: 'left' }}>
            <code style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span style={{ color: 'var(--muted)' }}>$ </span>git clone … && ./install-trading-journal.sh
            </code>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, color: copied ? 'var(--g)' : 'var(--muted)', whiteSpace: 'nowrap' }}>{copied ? 'Copied ✓' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div style={{ borderTop: '1px solid var(--hair)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '34px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: 8, background: 'var(--g)' }} />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--body)' }}>Trading Journal AI</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--faint)', marginLeft: 6 }}>trading-journal.ai</span>
        </div>
        <div style={{ display: 'flex', gap: 26, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>
          <a href={DEMO_URL} className="lnk" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Demo</a>
          <a href={GH_URL} className="lnk" style={{ color: 'var(--muted)', textDecoration: 'none' }}>GitHub</a>
          <span>MIT License</span>
          <span>© 2026</span>
        </div>
      </div>
    </div>
  );
}

function Page() {
  return (
    <div className="tj tj-dark" style={{ background: 'var(--page-bg, var(--bg))', color: 'var(--body)', minHeight: '100vh' }}>
      <Nav />
      <Hero />
      <Review />
      <Coach />
      <LocalFirst />
      <GetStarted />
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Page />);
