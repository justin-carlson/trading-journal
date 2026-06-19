// Landing page product mockups for trading-journal.ai.
// A scaled browser frame + the five review-loop stages, in the Deep dark
// theme. Reuses tokens from journal-data.jsx and the candle chart from
// trades-flow-chart.jsx. Exported to window.LM.

const { useState, useEffect, useRef } = React;
const TFC = window.TFChart;
const ms = window.moneySigned;

// ── Scaled stage: fixed design size, scaled to fill parent width ──
function Stage({ dw = 1000, dh = 600, children, style }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setScale(w / dw);
    });
    ro.observe(el);
    setScale(el.clientWidth / dw);
    return () => ro.disconnect();
  }, [dw]);
  return (
    <div ref={wrapRef} style={{ width: '100%', height: dh * scale, position: 'relative', ...style }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: dw, height: dh, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  );
}

// ── Browser frame chrome (trading-journal.ai/demo) ───────────────
function BrowserFrame({ children, url = 'trading-journal.ai/demo' }) {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: '0 40px 90px -30px rgba(0,0,0,.7), 0 12px 30px -12px rgba(0,0,0,.5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: '1px solid var(--hair)', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', gap: 7 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => <span key={c} style={{ width: 11, height: 11, borderRadius: 11, background: c, opacity: 0.9 }} />)}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 7, background: 'var(--bg)', border: '1px solid var(--hair)', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', maxWidth: 360 }}>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="var(--g)" strokeWidth="1.6"><rect x="3" y="6.5" width="8" height="5.5" rx="1" /><path d="M4.5 6.5V4.5a2.5 2.5 0 0 1 5 0v2" /></svg>
            {url}
          </div>
        </div>
        <div style={{ width: 52 }} />
      </div>
      {children}
    </div>
  );
}

// Shared bits
function Eb({ children, style }) { return <div className="tj-eyebrow" style={style}>{children}</div>; }
function MiniNav({ active }) {
  const items = ['Calendar', 'Trades', 'Journal', 'Reports'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '16px 28px', borderBottom: '1px solid var(--hair)' }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>Trading Journal</span>
      <div style={{ display: 'flex', gap: 20 }}>
        {items.map((n) => <span key={n} style={{ fontSize: 13, fontWeight: n === active ? 600 : 500, color: n === active ? 'var(--ink)' : 'var(--muted)' }}>{n}</span>)}
      </div>
    </div>
  );
}
function Scope({ active }) {
  const s = ['Today', 'This week', 'This month'];
  return (
    <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface)' }}>
      {s.map((x) => <span key={x} style={{ fontFamily: 'var(--mono)', fontSize: 11.5, fontWeight: 600, padding: '5px 11px', borderRadius: 6, color: x === active ? 'var(--ink)' : 'var(--muted)', background: x === active ? 'var(--surface-2)' : 'transparent' }}>{x}</span>)}
    </div>
  );
}
function StatRow({ items, size = 13.5 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--mono)', fontSize: size }}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ color: 'var(--faint)' }}>·</span>}
          <span style={{ color: it.c || 'var(--body)', fontWeight: it.c ? 600 : 400, whiteSpace: 'nowrap' }}>{it.t}</span>
        </React.Fragment>
      ))}
    </div>
  );
}
const PAD = '26px 30px';

// ════════════════════════════════════════════════════════════════
// 01 · IMPORT — broker CSV → month calendar fills with P&L
// ════════════════════════════════════════════════════════════════
function MockImport() {
  const M = window.MONTH;
  // Build a 5x7 month grid; map known days to pnl.
  const byIso = {};
  M.weeks.forEach((w) => w.days.forEach((d) => { byIso[d.date] = d.pnl; }));
  // June 2026: 1st is a Monday. 30 days.
  const cells = [];
  for (let i = 1; i <= 30; i++) cells.push(i);
  const pnlFor = (day) => byIso['June ' + day];
  return (
    <div style={{ height: 600 }}>
      <MiniNav active="Calendar" />
      <div style={{ padding: PAD }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <Eb style={{ marginBottom: 8 }}>Calendar · imported from broker CSV</Eb>
            <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>June 2026</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--g)' }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="var(--g)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 2v7M4 6l3 3 3-3M2.5 11.5h9" /></svg>
            das-paper-trades-2026.csv
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 7, marginTop: 18 }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <div key={d} className="tj-eyebrow" style={{ fontSize: 9.5, textAlign: 'left', paddingLeft: 2 }}>{d}</div>)}
          {cells.map((day) => {
            const dow = (day - 1) % 7; // Mon=0
            const weekend = dow >= 5;
            const p = pnlFor(day);
            const has = p != null;
            return (
              <div key={day} style={{ height: 74, borderRadius: 6, border: '1px solid var(--hair)', background: has ? (p >= 0 ? 'var(--g-bg)' : 'var(--r-bg)') : 'var(--surface)', padding: '7px 9px', opacity: weekend ? 0.4 : 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{day}</span>
                {has && <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, fontWeight: 600, color: p >= 0 ? 'var(--g)' : 'var(--r)' }}>{ms(p)}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 02 · RECAP — the day view with daily recap prose
// ════════════════════════════════════════════════════════════════
function MockRecap() {
  const D = window.WEEK.days[0];
  return (
    <div style={{ height: 600 }}>
      <MiniNav active="Journal" />
      <div style={{ padding: PAD }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--muted)' }}>Week 2&nbsp;&nbsp;·&nbsp;&nbsp;June 8 – June 12 2026</span>
          <Scope active="Today" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 13 }}>
          <span style={{ width: 11, height: 11, borderRadius: 11, background: 'var(--g)', alignSelf: 'center' }} />
          <h2 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
            Monday <span style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 500, color: 'var(--g)' }}>8</span>
          </h2>
        </div>
        <div style={{ marginTop: 12, paddingLeft: 24 }}>
          <StatRow items={[{ t: '5 trades' }, { t: '63% win' }, { t: 'PF 1.64' }, { t: 'P&L +$42.33', c: 'var(--g)' }]} />
        </div>
        <div style={{ marginTop: 24, paddingLeft: 24, display: 'grid', gridTemplateColumns: '1fr 250px', gap: 36 }}>
          <div>
            <Eb style={{ marginBottom: 12 }}>Daily Recap</Eb>
            <p style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.62, color: 'var(--ink)', textWrap: 'pretty' }}>{D.note}</p>
            <div style={{ display: 'flex', gap: 9, marginTop: 18 }}>
              {D.tags.map((t) => <span key={t} style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--g)', background: 'var(--g-bg)', borderRadius: 6, padding: '4px 11px' }}>{t}</span>)}
            </div>
          </div>
          <div>
            <Eb style={{ marginBottom: 12 }}>Trades</Eb>
            {D.trades.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < D.trades.length - 1 ? '1px solid var(--hair)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 5, background: t.p >= 0 ? 'var(--g)' : 'var(--r)' }} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{t.s}</span>
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, fontWeight: 600, color: t.p >= 0 ? 'var(--g)' : 'var(--r)' }}>{ms(t.p)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 03 · DRILL IN — ticker review: chart + trades for a symbol
// ════════════════════════════════════════════════════════════════
function MockDrill() {
  return (
    <div style={{ height: 600 }}>
      <MiniNav active="Trades" />
      <div style={{ padding: PAD }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
          <span style={{ color: 'var(--body)' }}>‹ Journal</span>&nbsp;&nbsp;|&nbsp;&nbsp;Trades&nbsp; / &nbsp;<span style={{ color: 'var(--ink)', fontWeight: 600 }}>NPT · Jun 8</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>NPT</h2>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)', paddingBottom: 4 }}>Jun 08, 2026</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 30, alignItems: 'start' }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 7, background: 'var(--bg)', padding: '14px 16px 6px' }}>
            <TFC.Chart w={640} plotH={250} volH={48} markers={TFC.MARKERS_FULL} seed={7} />
          </div>
          <div>
            <Eb style={{ marginBottom: 12 }}>Trades on NPT</Eb>
            {[{ n: 'Trade 1', f: '2 fills', p: 15.44 }, { n: 'Trade 2', f: '3 fills', p: 6.10 }, { n: 'Trade 3', f: '2 fills', p: -6.10 }].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid var(--hair)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{t.n}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{t.f}</div>
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: t.p >= 0 ? 'var(--g)' : 'var(--r)' }}>{ms(t.p)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 04 · TRADE NOTE — trade detail: chart + written note
// ════════════════════════════════════════════════════════════════
function MockNote() {
  return (
    <div style={{ height: 600 }}>
      <MiniNav active="Trades" />
      <div style={{ padding: PAD }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
          <span style={{ color: 'var(--body)' }}>‹ NPT</span>&nbsp;&nbsp;|&nbsp;&nbsp;Trades&nbsp; / &nbsp;NPT&nbsp; / &nbsp;<span style={{ color: 'var(--ink)', fontWeight: 600 }}>Trade 1</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>NPT</h2>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)', paddingBottom: 4 }}>Jun 08, 2026 · Trade 1</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 30, alignItems: 'start' }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 7, background: 'var(--bg)', padding: '14px 16px 6px' }}>
            <TFC.Chart w={600} plotH={240} volH={44} markers={TFC.MARKERS_ONE} seed={4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Eb>Net P&L</Eb>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--g)' }}>+$15.44</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                <Eb>Held</Eb>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>6m</span>
              </div>
            </div>
            <div style={{ height: 1, background: 'var(--hair)', margin: '4px 0 16px' }} />
            <Eb style={{ marginBottom: 11 }}>Trade Note</Eb>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <span style={{ width: 5, height: 5, borderRadius: 5, background: 'var(--g)' }} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--g)' }}>Best setup</span>
            </div>
            <p style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 15.5, lineHeight: 1.6, color: 'var(--prose)', textWrap: 'pretty' }}>Textbook green-to-red reclaim. Entered on the reclaim, added on the first pullback, trimmed half into the move. The A+ I keep talking about — patient entry, defined risk, let it work.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 05 · ZOOM OUT — week view, note nested under the day
// ════════════════════════════════════════════════════════════════
function MockZoom() {
  const W = window.WEEK;
  return (
    <div style={{ height: 600 }}>
      <MiniNav active="Journal" />
      <div style={{ padding: PAD }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--muted)' }}>June 2026&nbsp;&nbsp;·&nbsp;&nbsp;Week 2</span>
          <Scope active="This week" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 13, marginBottom: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 10, background: 'var(--r)', alignSelf: 'center' }} />
          <h2 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 500, color: 'var(--ink)' }}>Week 2</h2>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)' }}>June 8 – June 12</span>
        </div>
        <div style={{ paddingLeft: 23, marginBottom: 18 }}>
          <StatRow items={[{ t: '31 trades' }, { t: '60% win' }, { t: 'PF 0.82' }, { t: 'P&L −$478.64', c: 'var(--r)' }]} />
        </div>
        <div style={{ paddingLeft: 23, borderLeft: '1px solid var(--hair)', marginLeft: 4 }}>
          {W.days.map((d, i) => (
            <div key={i} style={{ padding: '13px 0', borderBottom: i < W.days.length - 1 ? '1px solid var(--hair)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 7, background: d.pnl >= 0 ? 'var(--g)' : 'var(--r)', marginLeft: -27 }} />
                  <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{d.weekday}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--muted)' }}>{d.date}</span>
                  {d.notes && d.notes.length > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--muted)' }}>
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 3h8v6l-2.5 2.5H3z" /><path d="M11 9H8.5v2.5" /></svg>
                      {d.notes.length} note{d.notes.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13.5, fontWeight: 600, color: d.pnl >= 0 ? 'var(--g)' : 'var(--r)' }}>{ms(d.pnl)}</span>
              </div>
              {i === 0 && (
                <div style={{ marginTop: 9, fontFamily: 'var(--serif)', fontSize: 14, lineHeight: 1.55, color: 'var(--prose)', maxWidth: 620, textWrap: 'pretty' }}>
                  {d.note}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// COACH — AI feedback graded against your own rules (full screen)
// ════════════════════════════════════════════════════════════════
function CoachSpark({ size = 14, color = 'var(--accent)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1.2c.2 2.7 1.9 4.7 4.6 5.1-2.7.4-4.4 2.4-4.6 5.1-.2-2.7-1.9-4.7-4.6-5.1C5.8 5.9 7.5 3.9 8 1.2Z" fill={color} />
      <circle cx="12.8" cy="11.6" r="1.6" fill={color} opacity="0.55" />
    </svg>
  );
}
function MockCoach() {
  const checks = [
    { ok: true, t: 'Waited for confirmation', s: 'Entry after the reclaim held' },
    { ok: true, t: 'Sized to plan', s: '10 sh · within your risk' },
    { ok: true, t: 'Let the winner work', s: 'Added on the first pullback' },
    { ok: false, t: 'Took profits early', s: 'Trimmed half before your 2R target' },
  ];
  return (
    <div style={{ height: 600 }}>
      <MiniNav active="Trades" />
      <div style={{ padding: PAD }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
          <span style={{ color: 'var(--body)' }}>‹ NPT</span>&nbsp;&nbsp;|&nbsp;&nbsp;Trades&nbsp; / &nbsp;NPT&nbsp; / &nbsp;<span style={{ color: 'var(--ink)', fontWeight: 600 }}>Trade 1</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, alignItems: 'start' }}>
          {/* trade context */}
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>NPT</h2>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--muted)', paddingBottom: 4 }}>Jun 08 · Trade 1</span>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 7, background: 'var(--bg)', padding: '12px 14px 4px' }}>
              <TFC.Chart w={420} plotH={186} volH={36} markers={TFC.MARKERS_ONE} seed={4} />
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 14, paddingLeft: 2 }}>
              <div><div className="tj-eyebrow" style={{ fontSize: 9.5, marginBottom: 5 }}>Net P&L</div><div style={{ fontFamily: 'var(--mono)', fontSize: 17, fontWeight: 600, color: 'var(--g)' }}>+$15.44</div></div>
              <div><div className="tj-eyebrow" style={{ fontSize: 9.5, marginBottom: 5 }}>Held</div><div style={{ fontFamily: 'var(--mono)', fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>6m</div></div>
            </div>
          </div>
          {/* coach panel */}
          <div style={{ border: '1px solid var(--accent-edge, var(--border))', borderRadius: 12, background: 'var(--surface)', padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CoachSpark size={14} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 500 }}>Coach review</span>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 21, fontWeight: 600, color: 'var(--g)', letterSpacing: '-0.01em' }}>A−</span>
            </div>
            <div className="tj-eyebrow" style={{ fontSize: 9.5, marginBottom: 13 }}>Read against your rules</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 18 }}>
              {checks.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                  <span style={{ flex: '0 0 auto', width: 18, height: 18, borderRadius: 18, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.ok ? 'var(--g-bg)' : 'var(--r-bg)', color: c.ok ? 'var(--g)' : 'var(--r)' }}>
                    {c.ok
                      ? <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5l2.5 2.5 4.5-5" /></svg>
                      : <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2.5v4M6 9h.01" /></svg>}
                  </span>
                  <div>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{c.t}</span>
                    <span style={{ fontSize: 12.5, color: 'var(--muted)', marginLeft: 8 }}>{c.s}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--hair)', paddingTop: 15 }}>
              <p style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 14.5, lineHeight: 1.58, color: 'var(--prose)', textWrap: 'pretty' }}>
                “Your highest-quality entry this week. The only drift was trimming early — the same pattern flagged Tuesday. Worth sizing the runner next time.”
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 15 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid var(--border)', borderRadius: 8, padding: '7px 13px', fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}><CoachSpark size={11} /> Use as note draft</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--faint)' }}>You always edit before it saves</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const STAGES = [
  { key: 'recap', kicker: 'Recap', desc: 'Start with the story of the session.', Mock: MockRecap },
  { key: 'reflect', kicker: 'Review & Reflect', desc: 'See the trade in context and note what mattered.', Mock: MockNote },
  { key: 'coach', kicker: 'Coach', desc: 'Get feedback graded against your own rules.', Mock: MockCoach },
];

window.LM = { Stage, BrowserFrame, STAGES, MockImport, MockRecap, MockDrill, MockNote, MockCoach, MockZoom };
