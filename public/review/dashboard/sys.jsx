// System layer — the design language codified as reusable primitives, shared
// across the re-skinned Dashboard / Calendar / Reports. Tokens come from
// journal-data.jsx (loaded first). Exports primitives + SystemLegend to window.
const { money, moneySigned, pct, pnlVar } = window;

function Eyebrow({ children, style }) {
  return <div className="tj-eyebrow" style={style}>{children}</div>;
}

function Card({ children, style, pad = 20 }) {
  return <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 7, padding: pad, ...style }}>{children}</div>;
}

// Hairline-divided horizontal strip (sharp, replaces rows of boxed cards).
function Strip({ children, cols }) {
  const items = React.Children.toArray(children);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: cols || `repeat(${items.length}, 1fr)`, border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden' }}>
      {items.map((c, i) => (
        <div key={i} style={{ padding: '15px 17px', borderLeft: i ? '1px solid var(--hair)' : 'none' }}>{c}</div>
      ))}
    </div>
  );
}

// Open section — eyebrow + optional right control over a hairline rule, no box.
function OpenSection({ eyebrow, right, children, style }) {
  return (
    <div style={style}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 11, borderBottom: '1px solid var(--hair)', marginBottom: 16 }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        {right}
      </div>
      {children}
    </div>
  );
}

// P&L figure — mono, tabular, colored, never wraps.
function Money({ v, size = 14, weight = 600, signed = true }) {
  return <span style={{ fontFamily: 'var(--mono)', fontSize: size, fontWeight: weight, color: pnlVar(v), fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{signed ? moneySigned(v) : money(v)}</span>;
}

function Num({ children, size = 14, color = 'var(--ink)', weight = 500 }) {
  return <span style={{ fontFamily: 'var(--mono)', fontSize: size, fontWeight: weight, color, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{children}</span>;
}

function Dot({ v, size = 9 }) {
  return <span style={{ width: size, height: size, borderRadius: size, background: pnlVar(v), display: 'inline-block', flex: '0 0 auto' }} />;
}

// Segmented toggle (Today/Week/Month, Cumulative/Daily, Month/Year).
function Toggle({ options, size = 12.5 }) {
  return (
    <div style={{ display: 'inline-flex', border: '1px solid var(--border)', borderRadius: 7, padding: 2, gap: 2 }}>
      {options.map((o) => (
        <span key={o.label} style={{
          padding: '6px 12px', borderRadius: 5, fontFamily: 'var(--sans)', fontSize: size, fontWeight: 600,
          color: o.active ? 'var(--ink)' : 'var(--muted)', background: o.active ? 'var(--surface-2)' : 'transparent', whiteSpace: 'nowrap',
        }}>{o.label}</span>
      ))}
    </div>
  );
}

// Ghost button / nav pill.
function Ghost({ children, accent }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', height: 34, padding: '0 12px', borderRadius: 8,
      border: `1px solid ${accent ? 'var(--accent)' : 'var(--border)'}`, fontFamily: 'var(--sans)', fontSize: 12.5,
      fontWeight: 600, color: accent ? 'var(--ink)' : 'var(--muted)', whiteSpace: 'nowrap', borderRadius: 6,
    }}>{children}</span>
  );
}

// Pill tag (process/emotion vocab) with valence dot.
function Tag({ children, tone = 'n' }) {
  const c = tone === 'g' ? 'var(--g)' : tone === 'r' ? 'var(--r)' : 'var(--muted)';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--sans)', fontSize: 11.5, fontWeight: 500, color: 'var(--body)', border: '1px solid var(--border)', borderRadius: 100, padding: '3px 9px', whiteSpace: 'nowrap' }}>
      {tone !== 'n' && <span style={{ width: 5, height: 5, borderRadius: 5, background: c }} />}{children}
    </span>
  );
}

// Stat block — eyebrow label + big mono value.
function StatBlock({ label, value, color, big }) {
  return (
    <div>
      <Eyebrow style={{ fontSize: 9.5 }}>{label}</Eyebrow>
      <div style={{ fontFamily: 'var(--mono)', fontSize: big ? 22 : 18, fontVariantNumeric: 'tabular-nums', color: color || 'var(--ink)', marginTop: 6, whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
}

// Horizontal count bar.
function HBar({ label, value, max, labelW = 64, valW = 44 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `${labelW}px 1fr ${valW}px`, alignItems: 'center', gap: 12 }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ height: 6, borderRadius: 6, background: 'var(--surface-2)' }}>
        <div style={{ height: 6, borderRadius: 6, background: 'var(--g)', opacity: 0.55, width: `${Math.max(2, (value / max) * 100)}%` }} />
      </div>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--muted)', textAlign: 'right', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}

// Diverging P&L bar (negative left, positive right of a center axis).
function DivBar({ label, pnl, max, labelW = 64, valW = 72 }) {
  const pos = pnl >= 0;
  const w = `${Math.max(2, (Math.abs(pnl) / max) * 100)}%`;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `${labelW}px 1fr ${valW}px`, alignItems: 'center', gap: 12 }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 6, borderRadius: 6, background: 'var(--surface-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{!pos && <div style={{ height: 6, borderRadius: 6, background: 'var(--r)', opacity: 0.7, width: w }} />}</div>
        <div>{pos && <div style={{ height: 6, borderRadius: 6, background: 'var(--g)', opacity: 0.7, width: w }} />}</div>
      </div>
      <span style={{ textAlign: 'right' }}><Money v={pnl} size={11.5} weight={500} /></span>
    </div>
  );
}

// Cumulative line chart (simple polyline — colored by final sign).
function LineChart({ points, height = 150, pad = 8 }) {
  const W = 600, H = height;
  const vals = points.map((p) => p.value);
  const min = Math.min(0, ...vals), max = Math.max(0, ...vals);
  const span = max - min || 1;
  const x = (i) => pad + (points.length === 1 ? 0 : (i / (points.length - 1)) * (W - pad * 2));
  const y = (v) => pad + ((max - v) / span) * (H - pad * 2);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
  const area = `${d} L ${x(points.length - 1).toFixed(1)} ${y(0).toFixed(1)} L ${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`;
  const final = vals.at(-1) ?? 0;
  const stroke = final >= 0 ? 'var(--g)' : 'var(--r)';
  const zeroY = y(0);
  const gid = 'g' + Math.random().toString(36).slice(2, 7);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, display: 'block' }} preserveAspectRatio="none">
      <defs><linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor={stroke} stopOpacity="0.18" /><stop offset="100%" stopColor={stroke} stopOpacity="0" />
      </linearGradient></defs>
      <line x1={pad} x2={W - pad} y1={zeroY} y2={zeroY} stroke="var(--hair)" strokeWidth="1" />
      <path d={area} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function PageFrame({ theme = 'tj-dark', title, eyebrow, children, max = 760 }) {
  return (
    <div className={`tj ${theme}`} style={{ background: 'var(--page-bg, var(--bg))', padding: '44px 48px 50px', color: 'var(--body)' }}>
      {/* top nav strip to anchor the page in the app shell */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, paddingBottom: 18, borderBottom: '1px solid var(--hair)', marginBottom: 30 }}>
        <span style={{ fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>Trading Journal</span>
        <div style={{ display: 'flex', gap: 18 }}>
          {['Dashboard', 'Calendar', 'Trades', 'Reports', 'Journal'].map((n) => (
            <span key={n} style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: n === title ? 600 : 500, color: n === title ? 'var(--ink)' : 'var(--muted)' }}>{n}</span>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: max }}>
        {eyebrow && <Eyebrow style={{ marginBottom: 12 }}>{eyebrow}</Eyebrow>}
        {children}
      </div>
    </div>
  );
}

function SystemLegend({ theme = 'tj-dark' }) {
  return (
    <div className={`tj ${theme}`} style={{ background: 'var(--bg)', padding: '46px 50px 52px', color: 'var(--body)' }}>
      <Eyebrow style={{ marginBottom: 12 }}>Design System &nbsp;·&nbsp; App Primitives</Eyebrow>
      <h1 style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>One language, every page</h1>
      <p style={{ margin: '12px 0 0', maxWidth: '60ch', fontFamily: 'var(--sans)', fontSize: 15, lineHeight: 1.6, color: 'var(--prose)' }}>
        The journal&rsquo;s vocabulary, distilled into shared parts: mono eyebrow labels, ink headings, tabular P&amp;L in muted green/red, a green/red dot for valence, segmented toggles, stat blocks, and the bar / line charts. Dashboard, Calendar and Reports are rebuilt entirely from these.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginTop: 32 }}>
        <div>
          <Eyebrow style={{ marginBottom: 12 }}>Toggles &amp; nav</Eyebrow>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <Toggle options={[{ label: 'Today' }, { label: 'Week', active: true }, { label: 'Month' }]} />
            <Ghost>Prev</Ghost><Ghost accent>Apply</Ghost>
          </div>
          <Eyebrow style={{ margin: '24px 0 12px' }}>Tags · valence</Eyebrow>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <Tag tone="g">Followed plan</Tag><Tag tone="g">Patient</Tag><Tag tone="r">Oversized</Tag><Tag tone="r">Tilted</Tag>
          </div>
          <Eyebrow style={{ margin: '24px 0 12px' }}>Stat blocks</Eyebrow>
          <div style={{ display: 'flex', gap: 28 }}>
            <StatBlock label="Weekly P&L" value={moneySigned(-478.64)} color="var(--r)" big />
            <StatBlock label="Win rate" value="60%" big />
            <StatBlock label="Profit factor" value="0.82" big />
          </div>
        </div>
        <div>
          <Eyebrow style={{ marginBottom: 12 }}>Charts</Eyebrow>
          <Card pad={14}>
            <LineChart points={[{ value: 42 }, { value: -75 }, { value: -52 }, { value: -537 }, { value: -479 }]} height={92} />
          </Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 16 }}>
            <HBar label="Mon" value={18} max={24} />
            <HBar label="Tue" value={24} max={24} />
            <DivBar label="Wed" pnl={22.21} max={484} />
            <DivBar label="Thu" pnl={-484.34} max={484} />
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Eyebrow, Card, Strip, OpenSection, Money, Num, Dot, Toggle, Ghost, Tag, StatBlock, HBar, DivBar, LineChart, PageFrame, SystemLegend });
