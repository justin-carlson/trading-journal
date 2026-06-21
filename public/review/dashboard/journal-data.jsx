// Shared sample data, helpers, and the refined token system for the
// Trading Journal visual exploration. Data is the real June 8–12 week from
// the screenshots, with authored journal prose so the "rich reading
// experience" actually reads like one. Exported to window.

// ── Token system (injected once) ───────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('tj-tokens')) {
  const s = document.createElement('style');
  s.id = 'tj-tokens';
  s.textContent = `
  .tj{
    --sans:'Hanken Grotesk',system-ui,sans-serif;
    --serif:'Newsreader',Georgia,serif;
    --mono:'Geist Mono',ui-monospace,monospace;
    font-family:var(--sans);
    -webkit-font-smoothing:antialiased;
    text-rendering:optimizeLegibility;
  }
  .tj-dark{
    --bg:#0b0d12; --page-bg:radial-gradient(135% 90% at 50% -10%, #11151d 0%, #0a0c11 60%);
    --surface:#12151d; --surface-2:#191d27;
    --border:#242a35; --hair:rgba(255,255,255,.06);
    --ink:#f1f4f8; --body:#c0c8d4; --prose:#99a3b1; --muted:#6e7886; --faint:#414b58;
    --g:oklch(0.82 0.14 158); --r:oklch(0.71 0.19 27);
    --g-bg:oklch(0.82 0.14 158 / 0.16); --r-bg:oklch(0.71 0.19 27 / 0.16);
    --g-edge:oklch(0.82 0.14 158 / 0.6); --r-edge:oklch(0.71 0.19 27 / 0.6);
    --accent:#4d9bff;
  }
  .tj-light{
    --bg:#f6f7f9; --surface:#ffffff; --surface-2:#f0f2f5;
    --border:#e4e7ec; --hair:rgba(0,0,0,.06);
    --ink:#191e26; --body:#414a56; --prose:#525c69; --muted:#6f7884; --faint:#a3abb6;
    --g:oklch(0.55 0.115 158); --r:oklch(0.55 0.17 27);
    --g-bg:oklch(0.55 0.115 158 / 0.10); --r-bg:oklch(0.55 0.17 27 / 0.10);
    --g-edge:oklch(0.55 0.115 158 / 0.5); --r-edge:oklch(0.55 0.17 27 / 0.5);
    --accent:#1f6feb;
  }
  .tj-eyebrow{font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;
    text-transform:uppercase;color:var(--muted);font-weight:500;}
  .tj ::selection{background:var(--g-bg);}
  `;
  document.head.appendChild(s);
}

function money(v) {
  const s = v < 0 ? '-' : '';
  return s + '$' + Math.abs(v).toFixed(2);
}
function moneySigned(v) {
  const s = v < 0 ? '−' : '+';
  return s + '$' + Math.abs(v).toFixed(2);
}
function pct(v) { return Math.round(v) + '%'; }
function pnlVar(v) { return v > 0 ? 'var(--g)' : v < 0 ? 'var(--r)' : 'var(--muted)'; }

// Flag → tone mapping (negative behaviours read red, positive green).
const FLAG_TONE = {
  'Best setup': 'g', 'Good trade': 'g', 'Followed plan': 'g',
  'Rule break': 'r', 'Revenge trade': 'r', 'Bad trade': 'r',
  'Overtraded': 'r', 'Chased': 'r', 'Oversized': 'r',
  'Needs review': 'n',
};

const WEEK = {
  num: 2,
  label: 'Week 2',
  range: 'June 8 – June 12, 2026',
  recap: 'Two clean green days bookended a brutal Thursday. The math is simple: one oversized GLXG trade erased the entire week — that’s the lesson, not the eight small losers on Tuesday. Keep red days small and Thursday never happens.',
  pnl: -478.64, trades: 31, accuracy: 60, profitFactor: 0.82,
  days: [
    {
      weekday: 'Monday', date: 'June 8', iso: '2026-06-08',
      pnl: 42.33, accuracy: 63, profitFactor: 1.64,
      note: 'Clean open. Waited for the first pullback on NPT instead of chasing the spike — that patience set the tone for the whole session. Sized normal, took profits into strength, and walked away after the morning push. Exactly the day I want to repeat.',
      tags: ['Patient', 'Followed plan'],
      trades: [{ s: 'NPT', p: 15.44 }, { s: 'INHD', p: 14.71 }, { s: 'SUNE', p: 8.36 }, { s: 'BYAH', p: 2.91 }, { s: 'PN', p: 0.90 }],
      notes: [{ s: 'NPT', flag: 'Best setup', text: 'Textbook green-to-red reclaim. Entered on the reclaim, added on the first pullback, trimmed half into the move. This is the A+ I keep talking about — patient entry, defined risk, let it work.' }],
    },
    {
      weekday: 'Tuesday', date: 'June 9', iso: '2026-06-09',
      pnl: -116.94, accuracy: 49, profitFactor: 0.69,
      note: 'Choppy, headline-driven tape. I knew by 9:45 it was a “sit on your hands” day and traded it anyway. Eight small names just churned commissions, and CCTG was the real damage — I added to a loser instead of cutting because I’d decided it “had to bounce.”',
      tags: ['Impatient', 'Overtraded'],
      trades: [{ s: 'PAVS', p: 23.84 }, { s: 'XELB', p: 15.54 }, { s: 'AZI', p: 11.90 }, { s: 'YOUL', p: 3.00 }, { s: 'RGNT', p: 1.02 }, { s: 'GMEX', p: -0.00 }, { s: 'EPSM', p: -1.75 }, { s: 'QTEX', p: -10.42 }, { s: 'UK', p: -12.47 }, { s: 'AHMA', p: -29.98 }, { s: 'CCTG', p: -117.60 }],
      notes: [{ s: 'CCTG', flag: 'Revenge trade', text: 'Took this right after the AHMA loss to “make it back.” Doubled size, no plan, moved my stop down twice. Worst trade of the week and it wasn’t close.' }],
    },
    {
      weekday: 'Wednesday', date: 'June 10', iso: '2026-06-10',
      pnl: 22.21, accuracy: 68, profitFactor: 1.99,
      note: 'Quiet and disciplined. Cut my size after Tuesday — the right call. Took only the setups written in the morning plan, nothing heroic. Green and calm. Recovery starts with small wins like this one.',
      tags: ['Calm', 'Followed plan'],
      trades: [{ s: 'DSY', p: 15.04 }, { s: 'BATL', p: 3.88 }, { s: 'VSME', p: 1.85 }, { s: 'FLD', p: 1.33 }, { s: 'CHOW', p: 0.11 }],
      notes: [{ s: 'DSY', flag: 'Good trade', text: 'Patient entry on the opening drive — took the meat of the move and left the rest alone. Small, but exactly the process I wanted to see the day after Tuesday.' }],
    },
    {
      weekday: 'Thursday', date: 'June 11', iso: '2026-06-11',
      pnl: -484.34, accuracy: 44, profitFactor: 0.24,
      note: 'Ugly. GLXG was a full-size position into a halt-prone runner with no clear stop — I had no business being that size. Two weeks of green undone in one afternoon. I need a hard daily max-loss that actually locks me out, not a number I can talk myself past.',
      tags: ['Frustrated', 'Oversized'],
      trades: [{ s: 'ADIL', p: 14.65 }, { s: 'LASE', p: -0.30 }, { s: 'GELS', p: -1.02 }, { s: 'EDHL', p: -52.65 }, { s: 'PPCB', p: -157.77 }, { s: 'GLXG', p: -287.26 }],
      notes: [
        { s: 'GLXG', flag: 'Rule break', text: 'Sized 3× my max on a halted name with no stop. Broke the one rule that actually protects the account. If I fix nothing else this month, I fix this.' },
        { s: 'ADIL', flag: 'Needs review', text: 'Small winner, but I held it twice as long as planned hoping it would carry the day. Right instinct, wrong reason — I was trying to dig out, not trade the setup.' },
      ],
    },
    {
      weekday: 'Friday', date: 'June 12', iso: '2026-06-12',
      pnl: 58.10, accuracy: 60, profitFactor: 1.42,
      note: 'Came in shaken but with a smaller plan and a hard stop written down before the open. Hit the stop once early and actually respected it. Ended green — but more importantly, ended in control. Closing the week down, not broken.',
      tags: ['Focused', 'Followed plan'],
      trades: [{ s: 'TXMD', p: 21.30 }, { s: 'RILY', p: 18.44 }, { s: 'BBAI', p: 12.06 }, { s: 'NUZE', p: 6.30 }],
      notes: [],
    },
  ],
};

// Compact prior week for the month outline.
const WEEK1 = {
  num: 1, label: 'Week 1', range: 'June 1 – June 5, 2026',
  recap: 'A strong, patient week — proof the plan works when I follow it. Sized up only on the A+ reclaim setups and sat out the chop.',
  pnl: 186.90, trades: 18, accuracy: 67, profitFactor: 2.10,
  days: [
    { weekday: 'Monday', date: 'June 1', iso: '2026-06-01', pnl: 88.20, accuracy: 71, profitFactor: 2.6, preview: 'Strong open, took the gap-and-go I planned. Best day in two weeks.', tags: ['Confident', 'Followed plan'], count: 4 },
    { weekday: 'Tuesday', date: 'June 2', iso: '2026-06-02', pnl: 31.05, accuracy: 60, profitFactor: 1.5, preview: 'Slower tape. One clean trade, then sat out the chop. Good discipline.', tags: ['Patient'], count: 2 },
    { weekday: 'Wednesday', date: 'June 3', iso: '2026-06-03', pnl: -54.40, accuracy: 40, profitFactor: 0.6, preview: 'Gave back gains chasing a second entry that was never really there.', tags: ['Chased'], count: 5 },
    { weekday: 'Thursday', date: 'June 4', iso: '2026-06-04', pnl: 112.75, accuracy: 75, profitFactor: 3.1, preview: 'A+ setup on the morning reclaim. Sized right and let it run.', tags: ['Focused', 'Best setup'], count: 4 },
    { weekday: 'Friday', date: 'June 5', iso: '2026-06-05', pnl: 9.30, accuracy: 55, profitFactor: 1.2, preview: 'Tiny green into the weekend. Protected the week, no heroics.', tags: ['Calm'], count: 3 },
  ],
};

// Day version of WEEK[0] etc. is reused directly. Compact day rows for month.
function weekToCompact(w) {
  return {
    ...w,
    days: w.days.map((d) => ({
      weekday: d.weekday, date: d.date, iso: d.iso, pnl: d.pnl,
      accuracy: d.accuracy, profitFactor: d.profitFactor,
      preview: d.preview || d.note, tags: d.tags,
      count: d.count != null ? d.count : d.trades.length,
    })),
  };
}

const MONTH = {
  label: 'June 2026',
  recap: 'June started strong — the first week proved the plan works when I follow it. Then Thursday the 11th happened: one oversized, ruleless trade did more damage than two good weeks of edge. The whole month’s focus now is a hard, automatic daily max-loss. Process over P&L.',
  pnl: -291.74, trades: 49, accuracy: 63, profitFactor: 1.05,
  weeks: [weekToCompact(WEEK1), weekToCompact(WEEK)],
};

Object.assign(window, { WEEK, WEEK1, MONTH, money, moneySigned, pct, pnlVar, FLAG_TONE });
