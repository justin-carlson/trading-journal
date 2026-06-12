"use client";

export type ChartCandle = {
  t: number; // epoch seconds (bar start)
  o: number;
  h: number;
  l: number;
  c: number;
  vol: number;
};

export type ChartMarker = {
  t: number; // epoch seconds
  price: number;
  side: "buy" | "sell";
};

const W = 900;
const H = 420;
const PAD = { top: 12, right: 58, bottom: 24, left: 8 };

const timeFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function candleIndexForMarker(candles: ChartCandle[], t: number): number {
  const minuteStart = Math.floor(t / 60) * 60;
  const containingIndex = candles.findIndex((c) => c.t === minuteStart);
  if (containingIndex !== -1) return containingIndex;

  let best = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < candles.length; i += 1) {
    const d = Math.abs(candles[i].t - t);
    if (d < bestDiff) {
      bestDiff = d;
      best = i;
    }
  }
  return best;
}

export default function TradeChart({
  candles,
  markers,
}: {
  candles: ChartCandle[];
  markers: ChartMarker[];
}) {
  if (candles.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
        No candle data available for this trade&apos;s window.
      </div>
    );
  }

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const cw = plotW / candles.length;

  // price range over candles + marker prices, with 4% padding
  let pMin = Infinity;
  let pMax = -Infinity;
  for (const c of candles) {
    pMin = Math.min(pMin, c.l);
    pMax = Math.max(pMax, c.h);
  }
  for (const m of markers) {
    pMin = Math.min(pMin, m.price);
    pMax = Math.max(pMax, m.price);
  }
  const span = pMax - pMin || 1;
  pMin -= span * 0.04;
  pMax += span * 0.04;

  const x = (i: number) => PAD.left + i * cw + cw / 2;
  const y = (p: number) => PAD.top + ((pMax - p) / (pMax - pMin)) * plotH;
  const bodyW = Math.max(1, cw * 0.6);

  const priceTicks = Array.from({ length: 5 }, (_, i) => pMin + ((pMax - pMin) * i) / 4);
  const timeTickIdx = Array.from({ length: 5 }, (_, i) =>
    Math.min(candles.length - 1, Math.round((candles.length - 1) * (i / 4))),
  );

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Trade chart">
        {/* grid + price axis */}
        {priceTicks.map((p, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(p)}
              y2={y(p)}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray="2 4"
            />
            <text
              x={W - PAD.right + 5}
              y={y(p) + 3.5}
              fill="var(--muted)"
              fontSize={10}
              fontFamily="monospace"
            >
              {p.toFixed(p < 10 ? 4 : 2).replace(/\.?0+$/, "")}
            </text>
          </g>
        ))}

        {/* time axis */}
        {timeTickIdx.map((idx) => (
          <text
            key={idx}
            x={x(idx)}
            y={H - 8}
            fill="var(--muted)"
            fontSize={10}
            fontFamily="monospace"
            textAnchor="middle"
          >
            {timeFmt.format(new Date(candles[idx].t * 1000))}
          </text>
        ))}

        {/* candles */}
        {candles.map((c, i) => {
          const up = c.c >= c.o;
          const color = up ? "var(--green)" : "var(--red)";
          const bodyTop = y(Math.max(c.o, c.c));
          const bodyH = Math.max(1, Math.abs(y(c.o) - y(c.c)));
          return (
            <g key={i}>
              <line x1={x(i)} x2={x(i)} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth={1} />
              <rect
                x={x(i) - bodyW / 2}
                y={bodyTop}
                width={bodyW}
                height={bodyH}
                fill={color}
              />
            </g>
          );
        })}

        {/* entry/exit markers */}
        {markers.map((m, i) => {
          const idx = candleIndexForMarker(candles, m.t);
          const mx = x(idx);
          const my = y(m.price);
          const s = 5;
          const buy = m.side === "buy";
          const pts = buy
            ? `${mx},${my + 3} ${mx - s},${my + 3 + s * 1.6} ${mx + s},${my + 3 + s * 1.6}`
            : `${mx},${my - 3} ${mx - s},${my - 3 - s * 1.6} ${mx + s},${my - 3 - s * 1.6}`;
          return (
            <polygon
              key={i}
              points={pts}
              fill={buy ? "#00ff7f" : "#ff3b3b"}
              stroke="rgba(255,255,255,0.85)"
              strokeWidth={0.8}
            />
          );
        })}
      </svg>
    </div>
  );
}
