// Opportunity Set — the orientation loop (Priority 2 + Learning object).
// From the wireframe: call the tape, then review the day's big movers — every
// name classified (captured / missed / poorly executed / false / avoided) and
// scored against the five pillars. You build the watchlist through the day,
// mark pillars in retrospect, and study how each name traded (mini-tape w/ VWAP
// + volume). The coach surfaces the verdict; the dashboard just collects it.
// Exports OpportunitySet, SessionLog, TapeBar, useMarket, PHASES to window.

const { Eyebrow: _Eyebrow } = window;

// ── pre-market movers (Mon, Jun 15) ──────────────────────────────
// Five pillars: Δ ≥10% · RVol ≥5× · Float <10M · News catalyst · Price $1–20
const MOVERS = [
  { id: 'gxai', s: 'GXAI', name: 'Gaxos.AI',           px: '$2.05', chg: 128, cat: 'AI contract PR',  pillars: { change: 1, volume: 1, float: 1, catalyst: 1, price: 1 }, spark: [1, 1.1, 1.7, 1.4, 2.3, 2.9, 2.6, 3.3], vol: [.4, .9, 1, .6, .8, .7, .5, .6] },
  { id: 'kzia', s: 'KZIA', name: 'Kazia Therapeutics', px: '$4.18', chg: 112, cat: 'FDA fast-track',   pillars: { change: 1, volume: 1, float: 1, catalyst: 1, price: 1 }, spark: [1, 1.4, 1.2, 2.0, 2.6, 2.3, 3.1, 3.0], vol: [.5, 1, .7, .9, .6, .5, .7, .4] },
  { id: 'holo', s: 'HOLO', name: 'MicroCloud',         px: '$3.80', chg: 64,  cat: 'Partnership',      pillars: { change: 1, volume: 1, float: 0, catalyst: 1, price: 1 }, spark: [1, 1.3, 1.1, 1.8, 2.1, 1.5, 1.3, 1.4], vol: [.6, .8, .5, 1, .7, .5, .4, .3] },
  { id: 'btbt', s: 'BTBT', name: 'Bit Digital',        px: '$5.10', chg: 38,  cat: 'BTC sympathy',     pillars: { change: 1, volume: 1, float: 0, catalyst: 0, price: 1 }, spark: [1, 1.2, 1.5, 1.3, 1.6, 1.4, 1.5, 1.5], vol: [.5, .6, .7, .5, .6, .4, .5, .4] },
  { id: 'nukk', s: 'NUKK', name: 'Nukkleus',           px: '$1.42', chg: 22,  cat: 'Low-float spec',   pillars: { change: 0, volume: 1, float: 1, catalyst: 0, price: 1 }, spark: [1, 1.5, 1.1, 0.9, 1.0, 0.9, 0.85, 0.9], vol: [1, .8, .5, .4, .3, .3, .2, .2] },
];

// Seeded review — a balanced, instructive day: one clean catch, one painful miss.
const SEED_LOG = {
  gxai: { outcome: 'missed',   why: 'Moving too fast at the open — couldn’t get a read, so I stood aside.' },
  kzia: { outcome: 'captured', why: 'Took the reclaim, trimmed half into strength. Textbook.' },
  holo: { outcome: 'poor',     why: 'Chased the entry late and gave most of it back.' },
  btbt: { outcome: 'avoided',  why: 'Theme felt crowded, no clean entry. Right to pass.' },
  nukk: { outcome: 'false',    why: 'Looked like a runner, faded on the first candle.' },
};

// Five pillars, exact labels from the wireframe.
const PILLARS = [['price', 'Price $1–20'], ['float', 'Float <10M'], ['volume', 'RVol ≥5×'], ['change', 'Δ ≥10%'], ['catalyst', 'News catalyst']];
const OUTCOMES = [
  { id: 'captured', label: 'Captured', tone: 'g', full: 'Captured opportunity' },
  { id: 'missed',   label: 'Missed',   tone: 'r', full: 'Missed opportunity' },
  { id: 'poor',     label: 'Poor exec', tone: 'r', full: 'Poorly executed' },
  { id: 'false',    label: 'False',    tone: 'n', full: 'False opportunity' },
  { id: 'avoided',  label: 'Avoided',  tone: 'g', full: 'Correct avoidance' },
];

// ── time-aware phases (surfaced at the top) ──────────────────────
const PHASES = [
  { id: 'pre',   label: 'Pre-market',   prompt: 'How did pre-market go? Lock your tape, themes, and A+ names before the open.' },
  { id: 'open',  label: 'Opening bell',  prompt: 'Highest-attention window. First clean setups only — mind the spread.' },
  { id: 'mid',   label: 'Midday',        prompt: 'Reorient. Is it still paying, or is this turning to churn?' },
  { id: 'power', label: 'Power hour',     prompt: 'Continuation or fade? Protect the day — don’t give it back.' },
  { id: 'after', label: 'After hours',    prompt: 'What moved late, and what carries into tomorrow’s plan?' },
];

function pillarCount(p) { return PILLARS.reduce((n, [k]) => n + (p[k] ? 1 : 0), 0); }
const toneColor = (t) => (t === 'r' ? 'var(--r)' : t === 'g' ? 'var(--g)' : 'var(--muted)');
const toneEdge = (t) => (t === 'r' ? 'var(--r-edge)' : t === 'g' ? 'var(--g-edge)' : 'var(--border)');
const toneBg = (t) => (t === 'g' ? 'var(--g-bg)' : t === 'r' ? 'var(--r-bg)' : 'var(--surface-2)');

const CONDITIONS = ['Trending', 'Choppy', 'Range', 'Risk-off'];
const THEME_BANK = ['AI', 'Biotech / FDA', 'Crypto', 'Energy', 'Earnings', 'Low-float runners'];

// shared, persisted market-read state
function useMarket() {
  const [m, setM] = React.useState(() => {
    try { const r = localStorage.getItem('tj-market-read'); if (r) return JSON.parse(r); } catch (e) {}
    return { condition: 'Choppy', themes: ['AI', 'Biotech / FDA'] };
  });
  React.useEffect(() => { try { localStorage.setItem('tj-market-read', JSON.stringify(m)); } catch (e) {} }, [m]);
  return [m, setM];
}

function loadLog() { try { const r = localStorage.getItem('tj-opp-log'); if (r) return JSON.parse(r); } catch (e) {} return SEED_LOG; }
function loadCustoms() { try { const r = localStorage.getItem('tj-opp-customs'); if (r) return JSON.parse(r); } catch (e) {} return []; }

// ── mini-tape: price line + VWAP + volume (study how it traded) ──
function MiniTape({ data, vol, w = 112, h = 46 }) {
  const pad = 2, volH = 10, priceH = h - volH - 4;
  const min = Math.min(...data), max = Math.max(...data), rng = (max - min) || 1;
  const up = data[data.length - 1] >= data[0];
  const color = up ? 'var(--g)' : 'var(--r)';
  const X = (i) => (i / (data.length - 1)) * (w - pad * 2) + pad;
  const Y = (v) => priceH - ((v - min) / rng) * (priceH - 2) - 1;
  const line = data.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const vwap = data.reduce((a, b) => a + b, 0) / data.length;
  const vy = Y(vwap);
  const vols = vol || data.map(() => 0.4);
  const vmax = Math.max(...vols) || 1;
  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }} title={`VWAP ${vwap.toFixed(2)} · ${up ? 'closed above open' : 'faded from open'}`}>
      <line x1={pad} y1={vy} x2={w - pad} y2={vy} stroke="var(--muted)" strokeWidth="1" strokeDasharray="2 3" opacity="0.55" />
      {vols.map((v, i) => {
        const bw = ((w - pad * 2) / vols.length) * 0.46;
        const bh = (v / vmax) * volH;
        return <rect key={i} x={X(i) - bw / 2} y={h - bh} width={bw} height={bh} rx="0.5" fill="var(--faint)" />;
      })}
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Pillars({ p, onToggle }) {
  const n = pillarCount(p);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }} title={PILLARS.filter(([k]) => p[k]).map(([, l]) => l).join(' · ') || 'Mark the pillars it met'}>
      <div style={{ display: 'flex', gap: 4 }}>
        {PILLARS.map(([k, l]) => (
          onToggle
            ? <button key={k} onClick={() => onToggle(k)} title={l} style={{ cursor: 'pointer', padding: 0, border: 'none', background: 'transparent', lineHeight: 0 }}>
                <span style={{ display: 'block', width: 8, height: 8, borderRadius: 8, background: p[k] ? 'var(--g)' : 'transparent', boxShadow: p[k] ? 'none' : 'inset 0 0 0 1.4px var(--faint)' }} />
              </button>
            : <span key={k} title={l} style={{ width: 7, height: 7, borderRadius: 7, background: p[k] ? 'var(--g)' : 'var(--faint)' }} />
        ))}
      </div>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, fontWeight: 600, color: n >= 4 ? 'var(--g)' : 'var(--muted)' }}>{n}/5</span>
    </div>
  );
}

// Coach's verdict on a reviewed mover.
function coachRead(m, outcome, n) {
  switch (outcome) {
    case 'missed':   return n >= 5 ? { tone: 'r', text: 'A+ on all five pillars — and you missed it. Name the reason so it doesn’t repeat.' }
                                   : { tone: 'n', text: `A ${n}/5 setup you didn’t catch. Worth knowing why.` };
    case 'poor':     return { tone: 'r', text: 'You were in it — the setup was there, the execution wasn’t. Review the entry and exit.' };
    case 'captured': return n >= 4 ? { tone: 'g', text: 'Quality setup, and you caught it. That’s the rep.' }
                                   : { tone: 'n', text: `Caught it — but only ${n}/5 pillars. Skill or luck?` };
    case 'avoided':  return n >= 4 ? { tone: 'n', text: 'You passed a 4/5. Sure that was discipline, not hesitation?' }
                                   : { tone: 'g', text: 'Right to pass — it didn’t clear the pillars.' };
    case 'false':    return { tone: 'n', text: 'Good read — looked like a setup, wasn’t. That’s the filter working.' };
    default: return { tone: 'n', text: 'Not reviewed yet. Mark its pillars and classify the outcome.' };
  }
}

function MoverRow({ m, entry, onChange, onRemove, first }) {
  const eff = entry.pillars || m.pillars;
  const n = pillarCount(eff);
  const coach = coachRead(m, entry.outcome, n);
  const whyRef = React.useRef(null);
  const togglePillar = (k) => onChange({ ...entry, pillars: { ...eff, [k]: eff[k] ? 0 : 1 } });
  return (
    <div style={{ padding: '18px 0', borderTop: first ? 'none' : '1px solid var(--hair)' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, minWidth: 172 }}>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{m.s}</span>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 12.5, color: 'var(--muted)' }}>{m.name}</span>
          {m.custom && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '.06em', color: 'var(--accent)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px' }}>ADDED</span>}
        </div>
        {m.chg != null
          ? <span style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 600, color: 'var(--g)', fontVariantNumeric: 'tabular-nums' }}>+{m.chg}%</span>
          : <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--faint)' }}>—</span>}
        {m.px && <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--muted)' }}>{m.px}</span>}
        <MiniTape data={m.spark} vol={m.vol} />
        <span style={{ flex: 1 }} />
        <Pillars p={eff} onToggle={togglePillar} />
        {m.custom && <button onClick={() => onRemove(m.id)} title="Remove" style={{ cursor: 'pointer', border: 'none', background: 'transparent', color: 'var(--faint)', fontSize: 17, lineHeight: 1, padding: '0 2px' }}>&times;</button>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.04em', color: 'var(--faint)', textTransform: 'uppercase' }}>{m.cat || 'On watch'}</span>
        <span style={{ flex: 1 }} />
        {/* classify the opportunity */}
        <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 5 }}>
          {OUTCOMES.map((o) => {
            const on = entry.outcome === o.id;
            return (
              <button key={o.id} onClick={() => onChange({ ...entry, outcome: o.id })} title={o.full} style={{
                cursor: 'pointer', padding: '5px 11px', borderRadius: 100, font: 'inherit',
                fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                border: `1px solid ${on ? toneEdge(o.tone) : 'var(--border)'}`,
                background: on ? toneBg(o.tone) : 'transparent',
                color: on ? 'var(--ink)' : 'var(--muted)',
              }}>{o.label}</button>
            );
          })}
        </div>
      </div>

      {/* why / why not */}
      <div
        ref={whyRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={() => onChange({ ...entry, why: whyRef.current.innerText.trim() })}
        data-ph="Why did you take it — or why not? What did the tape do?"
        style={{
          marginTop: 12, fontFamily: 'var(--sans)', fontSize: 14, lineHeight: 1.5, color: 'var(--body)',
          outline: 'none', cursor: 'text', minHeight: 21, paddingBottom: 9, borderBottom: '1px solid var(--hair)',
        }}
      >{entry.why}</div>

      {coach && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginTop: 12 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: '.08em', color: toneColor(coach.tone), border: `1px solid ${toneEdge(coach.tone)}`, borderRadius: 4, padding: '2px 6px', flex: '0 0 auto', marginTop: 1 }}>COACH</span>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 13.5, lineHeight: 1.5, color: coach.tone === 'r' ? 'var(--ink)' : 'var(--body)' }}>{coach.text}</span>
        </div>
      )}
    </div>
  );
}

// ── market read (inputs you call before the open) ────────────────
function MarketRead({ state, onChange }) {
  const toggleTheme = (t) => {
    const has = state.themes.includes(t);
    onChange({ ...state, themes: has ? state.themes.filter((x) => x !== t) : [...state.themes, t] });
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 28, alignItems: 'start' }}>
      <div>
        <_Eyebrow style={{ fontSize: 9, marginBottom: 11 }}>Market condition</_Eyebrow>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {CONDITIONS.map((c) => {
            const on = state.condition === c;
            return (
              <button key={c} onClick={() => onChange({ ...state, condition: c })} style={{
                cursor: 'pointer', border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                background: on ? 'var(--accent)' : 'transparent', borderRadius: 100, padding: '6px 14px',
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: on ? '#06121f' : 'var(--body)',
              }}>{c}</button>
            );
          })}
        </div>
      </div>
      <div>
        <_Eyebrow style={{ fontSize: 9, marginBottom: 11 }}>Active themes</_Eyebrow>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {THEME_BANK.map((t) => {
            const on = state.themes.includes(t);
            return (
              <button key={t} onClick={() => toggleTheme(t)} style={{
                cursor: 'pointer', border: `1px solid ${on ? 'var(--g-edge)' : 'var(--border)'}`,
                background: on ? 'var(--g-bg)' : 'transparent', borderRadius: 100, padding: '6px 12px',
                fontFamily: 'var(--sans)', fontSize: 12.5, fontWeight: 500, color: on ? 'var(--ink)' : 'var(--muted)',
              }}>{t}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── time-aware tape bar (surfaced at the very top) ───────────────
function TapeBar({ phase, onPhase, market }) {
  const cur = PHASES.find((p) => p.id === phase) || PHASES[0];
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 11, background: 'var(--surface)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
      <div style={{ display: 'inline-flex', border: '1px solid var(--border)', borderRadius: 8, padding: 3, gap: 2, background: 'var(--bg)' }}>
        {PHASES.map((p) => {
          const on = p.id === phase;
          return (
            <button key={p.id} onClick={() => onPhase(p.id)} style={{
              cursor: 'pointer', border: 'none', font: 'inherit', padding: '6px 13px', borderRadius: 6,
              fontFamily: 'var(--sans)', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
              color: on ? 'var(--ink)' : 'var(--muted)', background: on ? 'var(--surface-2)' : 'transparent',
            }}>{p.label}</button>
          );
        })}
      </div>
      <span style={{ fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--prose)', flex: 1, minWidth: 220 }}>{cur.prompt}</span>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.1em', color: 'var(--faint)' }}>TAPE</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid var(--accent)', borderRadius: 100, padding: '4px 12px' }}>
          <span style={{ width: 6, height: 6, borderRadius: 6, background: 'var(--accent)' }} />
          <span style={{ fontFamily: 'var(--sans)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{market.condition}</span>
        </span>
      </div>
    </div>
  );
}

// ── the whole section ────────────────────────────────────────────
function OpportunitySet({ market: mProp, onMarket }) {
  const internal = useMarket();
  const market = mProp || internal[0];
  const setMarket = onMarket || internal[1];

  const [log, setLog] = React.useState(loadLog);
  const [customs, setCustoms] = React.useState(loadCustoms);
  const [draft, setDraft] = React.useState('');
  React.useEffect(() => { try { localStorage.setItem('tj-opp-log', JSON.stringify(log)); } catch (e) {} }, [log]);
  React.useEffect(() => { try { localStorage.setItem('tj-opp-customs', JSON.stringify(customs)); } catch (e) {} }, [customs]);

  const setEntry = (id, e) => setLog((c) => ({ ...c, [id]: e }));
  const addName = () => {
    const s = draft.trim().toUpperCase();
    if (!s) return;
    const id = 'c' + Date.now();
    setCustoms((c) => [...c, { id, s, name: 'Added intraday', chg: null, px: '', custom: true, cat: '', spark: [1, 1, 1, 1, 1, 1], vol: [.3, .3, .3, .3, .3, .3], pillars: {} }]);
    setLog((c) => ({ ...c, [id]: { outcome: null, why: '', pillars: {} } }));
    setDraft('');
  };
  const removeName = (id) => { setCustoms((c) => c.filter((m) => m.id !== id)); setLog((c) => { const n = { ...c }; delete n[id]; return n; }); };

  const all = [...MOVERS, ...customs];
  const reviewed = all.filter((m) => (log[m.id] || {}).outcome).length;
  const missed = all.filter((m) => pillarCount((log[m.id] || {}).pillars || m.pillars || {}) >= 4 && (log[m.id] || {}).outcome === 'missed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Market context */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 11, background: 'var(--surface)', padding: '22px 24px' }}>
        <div style={{ marginBottom: 20 }}>
          <_Eyebrow style={{ marginBottom: 7 }}>Priority 2 &middot; market context</_Eyebrow>
          <h2 style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 21, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Call the tape before the bell</h2>
          <p style={{ margin: '10px 0 0', fontFamily: 'var(--sans)', fontSize: 14, lineHeight: 1.55, color: 'var(--prose)', maxWidth: '60ch' }}>
            Saying it out loud sets your bias and your filter for the day. What is the market, and what are you hunting?
          </p>
        </div>
        <MarketRead state={market} onChange={setMarket} />
      </div>

      {/* Top gainers review */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 11, background: 'var(--surface)', padding: '22px 24px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <_Eyebrow style={{ marginBottom: 7 }}>Top gainers review</_Eyebrow>
            <h2 style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 21, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>What moved &mdash; and did you trade it?</h2>
          </div>
          {missed > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid var(--r-edge)', borderRadius: 100, padding: '5px 12px' }}>
              <span style={{ width: 6, height: 6, borderRadius: 6, background: 'var(--r)' }} />
              <span style={{ fontFamily: 'var(--sans)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{missed} A+ missed</span>
            </span>
          )}
        </div>
        <p style={{ margin: '10px 0 2px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)' }}>
          5 pillars: Price $1&ndash;20 &middot; Float &lt;10M &middot; RVol &ge;5&times; &middot; &Delta; &ge;10% &middot; News catalyst &nbsp;&mdash;&nbsp; tap the dots to mark each &middot; {reviewed}/{all.length} reviewed
        </p>

        {all.map((m, i) => (
          <MoverRow key={m.id} m={m} entry={log[m.id] || { outcome: null, why: '', pillars: m.pillars }} onChange={(e) => setEntry(m.id, e)} onRemove={removeName} first={i === 0} />
        ))}

        {/* add a name to the watchlist */}
        <div style={{ display: 'flex', gap: 8, padding: '16px 0 18px', borderTop: '1px solid var(--hair)', marginTop: 4 }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addName(); }}
            placeholder="Add a ticker you're watching…"
            style={{ flex: 1, minWidth: 0, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 7, padding: '9px 12px', fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--ink)', outline: 'none', textTransform: 'uppercase' }}
          />
          <button onClick={addName} style={{ cursor: 'pointer', border: 'none', background: 'var(--accent)', borderRadius: 7, padding: '0 16px', fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: '#06121f', whiteSpace: 'nowrap' }}>+ Add</button>
        </div>
      </div>
    </div>
  );
}

// ── session log (lightweight thought capture, persisted) ─────────
function loadSession() {
  try { const r = localStorage.getItem('tj-session-log'); if (r) return JSON.parse(r); } catch (e) {}
  return [
    { t: 'Fri 3:58p', text: 'Respected the stop today. First time all week. Keep this.' },
    { t: 'Fri 9:40a', text: 'Slower open — sizing down until I see follow-through.' },
  ];
}
function SessionLog() {
  const [items, setItems] = React.useState(loadSession);
  const [draft, setDraft] = React.useState('');
  React.useEffect(() => { try { localStorage.setItem('tj-session-log', JSON.stringify(items)); } catch (e) {} }, [items]);

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    const t = now.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', '').toLowerCase();
    setItems((c) => [{ t, text }, ...c]);
    setDraft('');
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
          placeholder="Note what you're seeing…"
          style={{
            flex: 1, minWidth: 0, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 7,
            padding: '9px 12px', fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--ink)', outline: 'none',
          }}
        />
        <button onClick={add} style={{ cursor: 'pointer', border: 'none', background: 'var(--accent)', borderRadius: 7, padding: '0 14px', fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: '#06121f' }}>Log</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((it, i) => (
          <div key={i} style={{ padding: '11px 0', borderTop: i === 0 ? 'none' : '1px solid var(--hair)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--faint)', marginBottom: 4 }}>{it.t}</div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 13.5, lineHeight: 1.5, color: 'var(--body)' }}>{it.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── phase check-in (click the Phase cell to enter, set it, jot a note) ──
function loadPhaseNotes() {
  try { const r = localStorage.getItem('tj-phase-notes'); if (r) return JSON.parse(r); } catch (e) {}
  return [{ phase: 'Pre-market', t: 'Mon 8:12a', text: 'Quiet pre-market. Two clean A+ names on the FDA theme. One rule: respect the stop.' }];
}
function PhaseCheckIn({ phase, onPhase }) {
  const [notes, setNotes] = React.useState(loadPhaseNotes);
  const [draft, setDraft] = React.useState('');
  React.useEffect(() => { try { localStorage.setItem('tj-phase-notes', JSON.stringify(notes)); } catch (e) {} }, [notes]);
  const cur = PHASES.find((p) => p.id === phase) || PHASES[0];
  const add = () => {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    const t = now.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', '').toLowerCase();
    setNotes((c) => [{ phase: cur.label, t, text }, ...c]);
    setDraft('');
  };
  return (
    <div style={{ border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 9px 9px', background: 'var(--surface)', padding: '20px 22px', marginTop: -9 }}>
      <_Eyebrow style={{ fontSize: 9, marginBottom: 12 }}>Which window are you in?</_Eyebrow>
      <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {PHASES.map((p) => {
          const on = p.id === phase;
          return (
            <button key={p.id} onClick={() => onPhase(p.id)} style={{
              cursor: 'pointer', border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
              background: on ? 'var(--accent)' : 'transparent', borderRadius: 100, padding: '6px 13px',
              fontFamily: 'var(--sans)', fontSize: 12.5, fontWeight: 600, color: on ? '#06121f' : 'var(--body)', whiteSpace: 'nowrap',
            }}>{p.label}</button>
          );
        })}
      </div>
      <p style={{ margin: '0 0 14px', fontFamily: 'var(--sans)', fontSize: 14, lineHeight: 1.55, color: 'var(--prose)', maxWidth: '64ch' }}>{cur.prompt}</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: notes.length ? 18 : 0 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
          placeholder={`Note your ${cur.label.toLowerCase()} check-in…`}
          style={{ flex: 1, minWidth: 0, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 7, padding: '9px 12px', fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--ink)', outline: 'none' }}
        />
        <button onClick={add} style={{ cursor: 'pointer', border: 'none', background: 'var(--accent)', borderRadius: 7, padding: '0 16px', fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: '#06121f', whiteSpace: 'nowrap' }}>Log check-in</button>
      </div>
      {notes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {notes.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'baseline', padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--hair)' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: '.05em', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', flex: '0 0 auto', whiteSpace: 'nowrap' }}>{(it.phase || '').toUpperCase()}</span>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 13.5, lineHeight: 1.5, color: 'var(--body)', flex: 1 }}>{it.text}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--faint)', flex: '0 0 auto' }}>{it.t}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// placeholder styling for contentEditable fields
if (typeof document !== 'undefined' && !document.getElementById('tj-opp-style')) {
  const st = document.createElement('style');
  st.id = 'tj-opp-style';
  st.textContent = '[data-ph]:empty:before{content:attr(data-ph);color:var(--faint);}';
  document.head.appendChild(st);
}

Object.assign(window, { OpportunitySet, SessionLog, TapeBar, PhaseCheckIn, useMarket, PHASES });
