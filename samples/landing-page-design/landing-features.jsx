// Landing page feature close-ups: the note composer (real pill system) and
// the AI-coach concept teaser. Grounded in the repo's actual label sets
// (journalLabels.ts). Exported to window.LF.

const LFr = React;

// ── pill ─────────────────────────────────────────────────────────
function Pill({ label, tone = 'neutral', active, plus }) {
  let st;
  if (active && tone === 'positive') st = { background: 'var(--g-bg)', border: '1px solid var(--g-edge)', color: 'var(--g)' };
  else if (active && tone === 'negative') st = { background: 'var(--r-bg)', border: '1px solid var(--r-edge)', color: 'var(--r)' };
  else if (active) st = { background: 'var(--surface-2)', border: '1px solid var(--muted)', color: 'var(--ink)' };
  else st = { background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', ...st }}>
      {active && !plus && <span style={{ width: 5, height: 5, borderRadius: 5, background: 'currentColor' }} />}
      {plus && <span style={{ fontSize: 13, lineHeight: 1, opacity: 0.7 }}>+</span>}
      {label}
    </span>
  );
}
function GroupLabel({ children }) {
  return <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 11 }}>{children}</div>;
}

// ── A · Note composer (zoom-in on adding a note + pills) ─────────
function NoteComposerCard() {
  return (
    <div className="tj tj-dark" style={{ width: 600, minHeight: 560, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 30, fontFamily: 'var(--sans)', boxShadow: '0 30px 70px -30px rgba(0,0,0,.6)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
        <div className="tj-eyebrow" style={{ fontSize: 11 }}>Trade Note</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>NPT · Trade 1 · <span style={{ color: 'var(--g)' }}>+$15.44</span></div>
      </div>

      {/* primary label */}
      <GroupLabel>How was this trade?</GroupLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
        <Pill label="Best setup" tone="positive" active />
        <Pill label="Good trade" tone="positive" />
        <Pill label="Needs review" />
        <Pill label="Chased" tone="negative" />
        <Pill label="Rule break" tone="negative" />
      </div>

      {/* prose */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', padding: '16px 18px', marginBottom: 24 }}>
        <p style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.62, color: 'var(--ink)', textWrap: 'pretty' }}>
          Textbook green-to-red reclaim. Entered on the reclaim, added on the first pullback, trimmed half into the move — the A+ I keep talking about: patient entry, defined risk, let it work<span style={{ display: 'inline-block', width: 2, height: 18, background: 'var(--g)', marginLeft: 2, transform: 'translateY(3px)' }} className="lf-caret" />
        </p>
      </div>

      {/* process pills */}
      <GroupLabel>Process</GroupLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        <Pill label="Patient" tone="positive" active />
        <Pill label="Followed plan" tone="positive" active />
        <Pill label="Let winner work" tone="positive" active />
        <Pill label="Sized correctly" tone="positive" />
        <Pill label="Took profits early" tone="negative" />
        <Pill label="More" plus />
      </div>

      {/* emotion pills */}
      <GroupLabel>Emotion</GroupLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
        <Pill label="Calm" tone="positive" active />
        <Pill label="Focused" tone="positive" />
        <Pill label="Impatient" tone="negative" />
        <Pill label="FOMO" tone="negative" />
        <Pill label="More" plus />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--hair)', paddingTop: 18 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--faint)' }}>Autosaves to your local file</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'var(--g)', color: '#06121f', fontSize: 13.5, fontWeight: 600, padding: '9px 16px', borderRadius: 8 }}>
          Save note <span style={{ fontFamily: 'var(--mono)', fontSize: 11, opacity: 0.7 }}>⌘↵</span>
        </span>
      </div>
    </div>
  );
}

// ── spark mark for coach ─────────────────────────────────────────
function Spark({ size = 14, color = 'var(--accent)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1.2c.2 2.7 1.9 4.7 4.6 5.1-2.7.4-4.4 2.4-4.6 5.1-.2-2.7-1.9-4.7-4.6-5.1C5.8 5.9 7.5 3.9 8 1.2Z" fill={color} />
      <circle cx="12.8" cy="11.6" r="1.6" fill={color} opacity="0.55" />
    </svg>
  );
}

// ── B · Coach concept (teaser — grounded in codified inputs) ─────
function CoachConceptCard() {
  const checks = [
    { ok: true, t: 'Waited for confirmation', s: 'Entry after the reclaim held' },
    { ok: true, t: 'Sized to plan', s: '10 sh · within your risk' },
    { ok: true, t: 'Let the winner work', s: 'Added on the first pullback' },
    { ok: false, t: 'Took profits early', s: 'Trimmed half before your 2R target' },
  ];
  return (
    <div className="tj tj-dark" style={{ width: 600, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 30, fontFamily: 'var(--sans)', boxShadow: '0 30px 70px -30px rgba(0,0,0,.6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Spark />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 500 }}>Coach review</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>· NPT · Trade 1</span>
        </div>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 600, color: 'var(--g)', letterSpacing: '-0.01em' }}>A−</span>
      </div>

      <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 14 }}>Read against your rules</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 22 }}>
        {checks.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ flex: '0 0 auto', width: 19, height: 19, borderRadius: 19, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.ok ? 'var(--g-bg)' : 'var(--r-bg)', color: c.ok ? 'var(--g)' : 'var(--r)' }}>
              {c.ok
                ? <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5l2.5 2.5 4.5-5" /></svg>
                : <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2.5v4M6 9h.01" /></svg>}
            </span>
            <div>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{c.t}</span>
              <span style={{ fontSize: 13.5, color: 'var(--muted)', marginLeft: 9 }}>{c.s}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--hair)', paddingTop: 18 }}>
        <p style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 15.5, lineHeight: 1.6, color: 'var(--prose)', textWrap: 'pretty' }}>
          “Your highest-quality entry this week. The only drift was trimming early — the same pattern flagged Tuesday. Worth sizing the runner next time.”
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}><Spark size={12} color="var(--accent)" /> Use as note draft</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--faint)' }}>You always edit before it saves</span>
        </div>
      </div>
    </div>
  );
}

window.LF = { Pill, NoteComposerCard, CoachConceptCard, Spark };
