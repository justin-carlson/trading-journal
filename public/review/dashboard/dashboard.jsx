// Trading Journal — Dashboard (orientation surface).
// Visualizes the dashboard wireframe as two designed recaps:
//   · Morning Recap   — "where you left off", orient for the new day
//   · Afternoon Recap — mid/post-session reorientation
// Deep theme. Tokens/helpers + sample week from journal-data.jsx (window),
// primitives from sys.jsx (window). Exports DashboardApp to window.

const { money, moneySigned, pct, pnlVar, WEEK, WEEK1, MONTH } = window;
const { Eyebrow, OpenSection, Money, Num, StatBlock, LineChart, Tag } = window;

// ── Narrative data ───────────────────────────────────────────────
// "Today" is Monday, June 15 — picking up from Friday June 12 (last session).
const FRI = WEEK.days[4];          // Friday, June 12 (+58.10, "in control")
const WEEK_CUM = [42.33, -74.61, -52.40, -536.74, -478.64];

const MARKET = {
  themes: ['AI hardware', 'Biotech · FDA', 'Crypto sympathy'],
  candidates: [
    { s: 'KZIA', px: '$4.20', chg: '+34%', rvol: '8×', float: '6M', cat: 'FDA fast-track', state: 'A+' },
    { s: 'HOLO', px: '$3.80', chg: '+22%', rvol: '6×', float: '9M', cat: 'AI partnership', state: 'Watch' },
    { s: 'BTBT', px: '$5.10', chg: '+14%', rvol: '5×', float: '14M', cat: 'BTC sympathy', state: 'Watch' },
  ],
};

// Today's (fictional) session, used by the Afternoon recap.
const TODAY = {
  pnl: 71.40, peak: 118.20, peakAt: '10:40', trades: 4, winners: 3, accuracy: 75, pf: 2.9,
  maxLoss: 150,
  rows: [
    { s: 'TXMD', p: 44.10, t: '09:41' },
    { s: 'BBAI', p: 31.05, t: '10:18' },
    { s: 'NVNI', p: 7.85, t: '11:02' },
    { s: 'SOND', p: -11.60, t: '12:36' },
  ],
  // Intraday realized-equity path (for the give-back sparkline)
  curve: [0, 18, 44, 75, 118.2, 96, 84, 71.4],
};

// ── chrome ───────────────────────────────────────────────────────
function TopNav({ active = 'Dashboard' }) {
  const items = ['Dashboard', 'Calendar', 'Trades', 'Journal', 'Reports'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 30, padding: '18px 34px', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>Trading Journal</span>
      <div style={{ display: 'flex', gap: 24 }}>
        {items.map((n) => (
          <span key={n} style={{ fontSize: 14, fontWeight: n === active ? 600 : 500, color: n === active ? 'var(--ink)' : 'var(--muted)' }}>{n}</span>
        ))}
      </div>
      <span style={{ flex: 1 }} />
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 34, padding: '0 13px', borderRadius: 7, border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--body)' }}>
        <span style={{ whiteSpace: 'nowrap' }}>Live Account</span>
        <svg width="9" height="9" viewBox="0 0 11 11" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round"><path d="M2 4l3.5 3.5L9 4" /></svg>
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', height: 34, padding: '0 16px', borderRadius: 7, background: 'var(--accent)', fontSize: 13, fontWeight: 600, color: '#06121f' }}>Import</span>
    </div>
  );
}

// Interactive segmented control (Morning / Afternoon).
function RecapSwitch({ value, onChange }) {
  const opts = [
    { id: 'morning', label: 'Morning' },
    { id: 'afternoon', label: 'Afternoon' },
  ];
  return (
    <div style={{ display: 'inline-flex', border: '1px solid var(--border)', borderRadius: 8, padding: 3, gap: 3, background: 'var(--bg)' }}>
      {opts.map((o) => {
        const on = value === o.id;
        return (
          <button key={o.id} onClick={() => onChange(o.id)} style={{
            cursor: 'pointer', border: 'none', font: 'inherit', padding: '7px 16px', borderRadius: 6,
            fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
            color: on ? 'var(--ink)' : 'var(--muted)', background: on ? 'var(--surface-2)' : 'transparent',
            transition: 'color .15s, background .15s',
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

// One cell of the priority-1 command strip.
function CmdCell({ label, value, sub, valueColor, accent, first }) {
  return (
    <div style={{ padding: '16px 20px', borderLeft: first ? 'none' : '1px solid var(--hair)', position: 'relative' }}>
      {accent && <div style={{ position: 'absolute', top: -1, left: 0, width: 26, height: 2, background: 'var(--accent)' }} />}
      <Eyebrow style={{ fontSize: 9.5, marginBottom: 9 }}>{label}</Eyebrow>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 600, color: valueColor || 'var(--ink)', lineHeight: 1.15, letterSpacing: '-0.01em' }}>{value}</div>
      {sub && <div style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--muted)', marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>{sub}</div>}
    </div>
  );
}
function CommandStrip({ cells }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cells.length}, 1fr)`, border: '1px solid var(--border)', borderRadius: 9, overflow: 'hidden', background: 'var(--surface)' }}>
      {cells.map((c, i) => <CmdCell key={i} {...c} first={i === 0} />)}
    </div>
  );
}

function PageHead({ eyebrow, title, lead, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
      <div style={{ maxWidth: '62ch' }}>
        <Eyebrow style={{ marginBottom: 14 }}>{eyebrow}</Eyebrow>
        <h1 style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 38, fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--ink)', lineHeight: 1.04 }}>{title}</h1>
        <p style={{ margin: '16px 0 0', fontFamily: 'var(--sans)', fontSize: 16.5, lineHeight: 1.62, color: 'var(--prose)' }}>{lead}</p>
      </div>
      <div style={{ flex: '0 0 auto', paddingTop: 4 }}>{right}</div>
    </div>
  );
}

// Small labelled outcome stat (label above mono value).
function OutStat({ label, val, c, big }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Eyebrow style={{ fontSize: 9 }}>{label}</Eyebrow>
      <span style={{ fontFamily: 'var(--mono)', fontSize: big ? 30 : 15, fontWeight: 600, letterSpacing: big ? '-0.02em' : 0, color: c || 'var(--ink)', fontVariantNumeric: 'tabular-nums', lineHeight: 1, whiteSpace: 'nowrap' }}>{val}</span>
    </div>
  );
}

// ── Morning recap ────────────────────────────────────────────────
function MorningRecap({ showMarket, gap }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      <CommandStrip cells={[
        { label: 'Phase', value: 'Pre-market', sub: 'Opens in 1h 18m', accent: true },
        { label: 'Focus today', value: 'Respect the −$150 max-loss' },
        { label: 'Risk posture', value: 'Normal' },
        { label: 'Last review', value: 'Recovered discipline', sub: 'Fri, Jun 12 →' },
      ]} />

      <div style={{ display: 'grid', gridTemplateColumns: showMarket ? '1fr 312px' : '1fr 312px', gap: 44, alignItems: 'start' }}>
        {/* LEFT — the narrative */}
        <div style={{ display: 'flex', flexDirection: 'column', gap }}>
          {/* Last session */}
          <OpenSection eyebrow="Last session · Friday, Jun 12">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 40, flexWrap: 'wrap' }}>
              <OutStat label="Net P&L" val={moneySigned(FRI.pnl)} c="var(--g)" big />
              <OutStat label="Trades" val={String(FRI.trades.length)} />
              <OutStat label="Accuracy" val={pct(FRI.accuracy)} />
              <OutStat label="Profit factor" val={FRI.profitFactor.toFixed(2)} />
              <span style={{ alignSelf: 'center', display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid var(--g-edge)', borderRadius: 100, padding: '5px 12px' }}>
                <span style={{ width: 6, height: 6, borderRadius: 6, background: 'var(--g)' }} />
                <span style={{ fontFamily: 'var(--sans)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>Recovered discipline</span>
              </span>
            </div>
            <p style={{ margin: '20px 0 0', fontFamily: 'var(--sans)', fontSize: 15.5, lineHeight: 1.64, color: 'var(--prose)', maxWidth: '66ch' }}>{FRI.note}</p>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 16 }}>
              {FRI.tags.map((t) => <Tag key={t} tone="g">{t}</Tag>)}
            </div>
          </OpenSection>

          {/* The experiment — heart of the morning brief */}
          <OpenSection eyebrow="The rule you're running" right={
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>DAY 1 OF 10</span>
          }>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 23, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Hard daily max-loss</h2>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 23, fontWeight: 600, color: 'var(--r)', fontVariantNumeric: 'tabular-nums' }}>{'−$150'}</span>
            </div>
            <p style={{ margin: '14px 0 0', fontFamily: 'var(--sans)', fontSize: 15.5, lineHeight: 1.64, color: 'var(--prose)', maxWidth: '66ch' }}>
              When realized losses hit <span style={{ fontFamily: 'var(--mono)', color: 'var(--body)' }}>{'−$150'}</span>, you're locked out for the day &mdash; no moving it, no &ldquo;one more.&rdquo; Set Friday after the GLXG break. This is the one rule that actually protects the account.
            </p>
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--hair)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--muted)' }}>Why it exists</span>
              <span style={{ color: 'var(--faint)' }}>&middot;</span>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--body)' }}>Thursday's one oversized GLXG trade (<span style={{ fontFamily: 'var(--mono)', color: 'var(--r)' }}>{'−$287'}</span>) erased two good weeks.</span>
            </div>
          </OpenSection>

          {/* Account pulse */}
          <OpenSection eyebrow="Account pulse" right={
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--muted)' }}>Last 5 sessions</span>
          }>
            <div style={{ display: 'flex', gap: 44, flexWrap: 'wrap', marginBottom: 22 }}>
              <StatBlock label="This week" value={moneySigned(WEEK.pnl)} color="var(--r)" big />
              <StatBlock label="This month" value={moneySigned(MONTH.pnl)} color="var(--r)" big />
              <StatBlock label="Win rate" value={pct(WEEK.accuracy)} big />
              <StatBlock label="Profit factor" value={WEEK.profitFactor.toFixed(2)} big />
            </div>
            <LineChart points={WEEK_CUM.map((v) => ({ value: v }))} height={120} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              {WEEK.days.map((d) => (
                <span key={d.iso} style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--muted)' }}>{d.weekday.slice(0, 3)}</span>
              ))}
            </div>
          </OpenSection>
        </div>

        {/* RIGHT — rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap }}>
          <OpenSection eyebrow="Last week">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {WEEK.days.map((d, i) => (
                <div key={d.iso} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < WEEK.days.length - 1 ? '1px solid var(--hair)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 7, background: pnlVar(d.pnl), flex: '0 0 auto' }} />
                    <span style={{ fontFamily: 'var(--sans)', fontSize: 13.5, fontWeight: 500, color: 'var(--body)' }}>{d.weekday}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)' }}>{d.date.replace('June ', 'Jun ')}</span>
                  </div>
                  <Money v={d.pnl} size={13} />
                </div>
              ))}
            </div>
          </OpenSection>

          {showMarket && (
            <OpenSection eyebrow="Watching today" right={
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--faint)' }}>Manual</span>
            }>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 18 }}>
                {MARKET.themes.map((t) => (
                  <span key={t} style={{ fontFamily: 'var(--sans)', fontSize: 11.5, fontWeight: 500, color: 'var(--body)', border: '1px solid var(--border)', borderRadius: 100, padding: '4px 10px' }}>{t}</span>
                ))}
              </div>
              <Eyebrow style={{ fontSize: 9, marginBottom: 12 }}>A+ candidates · 5-pillar</Eyebrow>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {MARKET.candidates.map((c) => (
                  <div key={c.s}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{c.s}</span>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--muted)' }}>{c.px}</span>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--g)' }}>{c.chg}</span>
                      </div>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, letterSpacing: '.04em', color: c.state === 'A+' ? 'var(--ink)' : 'var(--muted)', border: `1px solid ${c.state === 'A+' ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 5, padding: '2px 7px' }}>{c.state}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)', marginTop: 5 }}>
                      RVol {c.rvol} &middot; Float {c.float} &middot; {c.cat}
                    </div>
                  </div>
                ))}
              </div>
            </OpenSection>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Afternoon recap ──────────────────────────────────────────────
function AfternoonRecap({ showMarket, gap }) {
  const givebackPct = Math.round((1 - TODAY.pnl / TODAY.peak) * 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      <CommandStrip cells={[
        { label: 'Phase', value: 'Power hour', sub: 'Closes in 1h 26m', accent: true },
        { label: 'Realized today', value: moneySigned(TODAY.pnl), valueColor: 'var(--g)' },
        { label: 'Risk posture', value: 'Take only A+' },
        { label: 'vs max-loss', value: 'Full headroom', sub: `${moneySigned(TODAY.pnl)} of −$150` },
      ]} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 312px', gap: 44, alignItems: 'start' }}>
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap }}>
          <OpenSection eyebrow="Today so far">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 40, flexWrap: 'wrap', marginBottom: 22 }}>
              <OutStat label="Realized P&L" val={moneySigned(TODAY.pnl)} c="var(--g)" big />
              <OutStat label="Trades" val={`${TODAY.winners}/${TODAY.trades}`} />
              <OutStat label="Accuracy" val={pct(TODAY.accuracy)} />
              <OutStat label="Profit factor" val={TODAY.pf.toFixed(1)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {TODAY.rows.map((r, i) => (
                <div key={r.s} style={{ display: 'grid', gridTemplateColumns: '52px 1fr auto', gap: 14, alignItems: 'center', padding: '11px 0', borderBottom: i < TODAY.rows.length - 1 ? '1px solid var(--hair)' : 'none', fontVariantNumeric: 'tabular-nums' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--muted)' }}>{r.t}</span>
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{r.s}</span>
                  <Money v={r.p} size={13.5} />
                </div>
              ))}
            </div>
          </OpenSection>

          <OpenSection eyebrow="Give-back check" right={
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--muted)' }}>Peak {moneySigned(TODAY.peak)} · {TODAY.peakAt}</span>
          }>
            <LineChart points={TODAY.curve.map((v) => ({ value: v }))} height={104} />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 16 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 600, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{givebackPct}%</span>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--body)' }}>given back from the {TODAY.peakAt} high.</span>
            </div>
            <p style={{ margin: '12px 0 0', fontFamily: 'var(--sans)', fontSize: 15, lineHeight: 1.6, color: 'var(--prose)', maxWidth: '64ch' }}>
              You're still holding most of it. The risk now isn't the max-loss &mdash; it's handing a green day back chasing a fifth trade into a thinning tape.
            </p>
          </OpenSection>

          <OpenSection eyebrow="Risk posture · take only A+">
            <p style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 15.5, lineHeight: 1.64, color: 'var(--prose)', maxWidth: '66ch' }}>
              Spreads are widening and second-leg moves stopped working around noon. The tape isn't paying like it did at the open &mdash; size down, slow down, and only take an A+ candidate that meets all five pillars.
            </p>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 16 }}>
              <Tag tone="n">Quality thinning</Tag>
              <Tag tone="r">Spreads widening</Tag>
              <Tag tone="g">Green &amp; in control</Tag>
            </div>
          </OpenSection>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap }}>
          <OpenSection eyebrow="Say it / write it">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { q: 'What am I seeing?', a: 'Thin, selective tape. One theme left.' },
                { q: 'What am I feeling?', a: 'Calm. A little eager to add to the day.' },
                { q: 'What am I about to do?', a: 'Wait. Only an A+ or I’m flat into close.' },
              ].map((p) => (
                <div key={p.q}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 7 }}>{p.q}</div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--body)', lineHeight: 1.5, borderLeft: '2px solid var(--accent)', paddingLeft: 12 }}>{p.a}</div>
                </div>
              ))}
            </div>
          </OpenSection>

          <OpenSection eyebrow="Carries into tomorrow">
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 13 }}>
              {[
                'Max-loss held on Day 1 — log it, the streak matters.',
                'KZIA still on the FDA theme — re-check pre-market.',
                'SOND was a forced re-entry; note it in the journal.',
              ].map((n, i) => (
                <li key={i} style={{ display: 'flex', gap: 11, fontFamily: 'var(--sans)', fontSize: 14, lineHeight: 1.55, color: 'var(--body)' }}>
                  <span style={{ color: 'var(--faint)', fontFamily: 'var(--mono)' }}>{String(i + 1).padStart(2, '0')}</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </OpenSection>
        </div>
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────
function DashboardApp({ view, showMarket, density, accent, onSetView }) {
  const gap = density === 'compact' ? 30 : 44;
  const head = view === 'morning'
    ? {
        eyebrow: 'Morning recap · Mon, Jun 15 · Pre-market 8:12 AM ET',
        title: 'Where you left off',
        lead: <>Friday you came in shaken, traded a smaller plan, and respected your stop for the first time in a week &mdash; closing green and in control. The lesson from Thursday still stands: one oversized trade can erase two good weeks. Carry the max-loss in.</>,
      }
    : {
        eyebrow: 'Afternoon check-in · Mon, Jun 15 · Power hour 2:34 PM ET',
        title: "How's it going?",
        lead: <>Four trades, green, and you never came close to the max-loss line. Quality is thinning into the close &mdash; the work now is not giving it back, and not forcing a fifth.</>,
      };

  return (
    <div className="tj tj-dark" style={{ '--accent': accent, background: 'var(--page-bg, var(--bg))', color: 'var(--body)', minHeight: '100vh', fontFamily: 'var(--sans)' }}>
      <TopNav active="Dashboard" />
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 40px 72px' }}>
        <PageHead {...head} right={<RecapSwitch value={view} onChange={onSetView} />} />
        <div style={{ height: 1, background: 'var(--hair)', margin: '32px 0' }} />
        {view === 'morning'
          ? <MorningRecap showMarket={showMarket} gap={gap} />
          : <AfternoonRecap showMarket={showMarket} gap={gap} />}
      </div>
    </div>
  );
}

window.DashboardApp = DashboardApp;
