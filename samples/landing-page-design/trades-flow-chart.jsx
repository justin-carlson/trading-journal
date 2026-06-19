// Reusable static candlestick + volume chart for the Trades flow mockups.
// Deterministic NVDL-shaped series (dip → rally) matching the screenshots.
// No real data; purely visual. Exported to window.TFChart.

function genCandles(n, seed) {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const out = [];
  let price = 114.62;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    let drift;
    if (t < 0.30) drift = -0.05;        // early slide
    else if (t < 0.46) drift = 0.16;    // sharp reclaim
    else if (t < 0.74) drift = 0.045;   // grind up
    else drift = -0.012;                // fade
    const o = price;
    const noise = (rnd() - 0.5) * 0.17;
    let c = o + drift + noise;
    const hi = Math.max(o, c) + rnd() * 0.11;
    const lo = Math.min(o, c) - rnd() * 0.11;
    const vol = (0.35 + rnd() * 0.4 + (t > 0.3 && t < 0.55 ? 0.5 : 0));
    out.push({ o, h: hi, l: lo, c, vol });
    price = c;
  }
  return out;
}

// markers: index into candle array, side buy/sell. Mirrors the two-fill trades.
const MARKERS_FULL = [
  { i: 18, side: 'sell' }, { i: 21, side: 'buy' }, { i: 24, side: 'buy' },
  { i: 30, side: 'buy' }, { i: 31, side: 'sell' }, { i: 40, side: 'buy' }, { i: 41, side: 'sell' },
];
const MARKERS_ONE = [{ i: 24, side: 'buy' }, { i: 21, side: 'sell' }];

const TIME_LABELS = ['15:34', '15:45', '15:56', '16:07', '16:18'];

function Chart({ w = 800, plotH = 320, volH = 56, markers = MARKERS_FULL, seed = 7 }) {
  const candles = React.useMemo(() => genCandles(46, seed), [seed]);
  const padR = 52, padL = 6, padT = 10;
  const plotW = w - padR - padL;
  const prices = candles.flatMap((c) => [c.h, c.l]);
  const max = Math.max(...prices), min = Math.min(...prices);
  const range = max - min || 1;
  const innerH = plotH - padT - 6;
  const y = (p) => padT + (1 - (p - min) / range) * innerH;
  const n = candles.length;
  const step = plotW / n;
  const bw = Math.max(3, step * 0.56);
  const x = (i) => padL + step * i + step / 2;

  const maxVol = Math.max(...candles.map((c) => c.vol));
  const volTop = plotH + 20;
  const volBase = volTop + volH;
  const totalH = volBase + 24;

  const labelVals = [0, 1, 2, 3, 4].map((k) => max - (range * k) / 4);

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${totalH}`} style={{ display: 'block' }} preserveAspectRatio="none">
      {/* horizontal gridlines + price labels */}
      {labelVals.map((v, k) => (
        <g key={k}>
          <line x1={padL} x2={padL + plotW} y1={y(v)} y2={y(v)} stroke="var(--hair)" strokeWidth="1" strokeDasharray="2 4" />
          <text x={w - padR + 8} y={y(v) + 4} fontFamily="var(--mono)" fontSize="11" fill="var(--muted)" style={{ fontVariantNumeric: 'tabular-nums' }}>{v.toFixed(2)}</text>
        </g>
      ))}

      {/* candles */}
      {candles.map((c, i) => {
        const up = c.c >= c.o;
        const col = up ? 'var(--g)' : 'var(--r)';
        const bodyTop = y(Math.max(c.o, c.c));
        const bodyBot = y(Math.min(c.o, c.c));
        return (
          <g key={i}>
            <line x1={x(i)} x2={x(i)} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth="1" />
            <rect x={x(i) - bw / 2} y={bodyTop} width={bw} height={Math.max(1, bodyBot - bodyTop)} fill={col} rx="0.5" />
          </g>
        );
      })}

      {/* execution markers */}
      {markers.map((m, k) => {
        const cx = x(m.i);
        if (m.side === 'buy') {
          const cy = y(candles[m.i].l) + 11;
          return <path key={k} d={`M ${cx} ${cy - 7} L ${cx + 5.5} ${cy + 3} L ${cx - 5.5} ${cy + 3} Z`} fill="var(--g)" stroke="var(--bg)" strokeWidth="1" />;
        }
        const cy = y(candles[m.i].h) - 11;
        return <path key={k} d={`M ${cx} ${cy + 7} L ${cx + 5.5} ${cy - 3} L ${cx - 5.5} ${cy - 3} Z`} fill="var(--r)" stroke="var(--bg)" strokeWidth="1" />;
      })}

      {/* VOL label */}
      <text x={w - padR + 8} y={volTop - 4} fontFamily="var(--mono)" fontSize="10" letterSpacing="0.12em" fill="var(--faint)">VOL</text>

      {/* volume bars */}
      {candles.map((c, i) => {
        const up = c.c >= c.o;
        const h = (c.vol / maxVol) * volH;
        return <rect key={i} x={x(i) - bw / 2} y={volBase - h} width={bw} height={h} fill={up ? 'var(--g-bg)' : 'var(--r-bg)'} />;
      })}

      {/* time axis */}
      {TIME_LABELS.map((t, k) => (
        <text key={k} x={padL + (plotW * k) / 4} y={totalH - 6} fontFamily="var(--mono)" fontSize="11" fill="var(--muted)"
          textAnchor={k === 0 ? 'start' : k === 4 ? 'end' : 'middle'}>{t}</text>
      ))}
    </svg>
  );
}

window.TFChart = { Chart, MARKERS_FULL, MARKERS_ONE };
