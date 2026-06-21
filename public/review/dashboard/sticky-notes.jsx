// Sticky cues — "notes on the glass."
// The coach recommends posting cue notes around your monitor; this brings
// that ritual into the dashboard. Draggable paper notes, check them off as
// you run the cue, edit inline, add your own. Persisted to localStorage.
// Exports StickyBoard to window. Deep theme aware.

const PAPERS = {
  amber: { bg: '#f1cf5b', edge: '#d8b443', ink: '#34301f', tab: '#e7c24e' },
  peach: { bg: '#f0ad84', edge: '#dd9870', ink: '#3a271c', tab: '#e89f72' },
  mint:  { bg: '#bfe0a8', edge: '#a6cc8d', ink: '#243019', tab: '#b2d699' },
  sky:   { bg: '#a8d0ef', edge: '#8fbbe0', ink: '#1c2c3a', tab: '#97c4e8' },
};
const PAPER_KEYS = Object.keys(PAPERS);

const SEED_NOTES = [
  { id: 'n1', cat: 'Execution', body: 'Check Level 2 before you click. Is the offer stacked or thin?', paper: 'amber', x: 18,  y: 20,  rot: -3, done: false },
  { id: 'n2', cat: 'Setup',     body: 'Is volume confirming the move — or are you early again?',      paper: 'mint',  x: 250, y: 40,  rot: 2.4, done: false },
  { id: 'n3', cat: 'Risk',      body: 'Max loss is −$150. It does not move. Ever.',                   paper: 'peach', x: 486, y: 16,  rot: -1.6, done: false },
  { id: 'n4', cat: 'Mindset',   body: 'Wait for YOUR setup. FOMO is not a setup.',                         paper: 'sky',   x: 150, y: 196, rot: 1.5, done: false },
  { id: 'n5', cat: 'Mindset',   body: "You're green. Don't hand it back chasing a 5th trade.",             paper: 'amber', x: 392, y: 210, rot: -2.6, done: false },
];

const QUICK_CUES = [
  'Did I check Level 2?',
  'Is volume confirming?',
  'Am I forcing this?',
  'What’s my exit before I enter?',
  'A+ only — walk if it’s not.',
];

function loadNotes() {
  try {
    const raw = localStorage.getItem('tj-sticky-cues');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return SEED_NOTES;
}

function StickyNote({ note, onChange, onDelete, onDragStart, dragging }) {
  const p = PAPERS[note.paper] || PAPERS.amber;
  const bodyRef = React.useRef(null);

  const cyclePaper = () => {
    const i = PAPER_KEYS.indexOf(note.paper);
    onChange({ ...note, paper: PAPER_KEYS[(i + 1) % PAPER_KEYS.length] });
  };
  const commit = () => {
    if (bodyRef.current) onChange({ ...note, body: bodyRef.current.innerText.trim() });
  };

  return (
    <div
      onPointerDown={(e) => {
        // don't start a drag from interactive bits
        if (e.target.closest('[data-no-drag]')) return;
        onDragStart(e, note);
      }}
      style={{
        position: 'absolute', left: note.x, top: note.y, width: 196, minHeight: 150,
        transform: `rotate(${note.rot}deg) scale(${dragging ? 1.04 : 1})`,
        transition: dragging ? 'none' : 'transform .18s cubic-bezier(.2,.7,.3,1), box-shadow .18s',
        background: p.bg, color: p.ink,
        padding: '14px 15px 16px', cursor: 'grab', userSelect: 'none',
        boxShadow: dragging
          ? '0 22px 40px -10px rgba(0,0,0,.6), 0 2px 4px rgba(0,0,0,.3)'
          : '0 10px 22px -8px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.3)',
        zIndex: dragging ? 50 : 1,
        opacity: note.done ? 0.62 : 1,
      }}
    >
      {/* tape */}
      <div style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%) rotate(-1.5deg)', width: 52, height: 17, background: 'rgba(255,255,255,.22)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <button data-no-drag onClick={cyclePaper} title="Change color" style={{
          cursor: 'pointer', border: 'none', background: 'transparent', padding: 0,
          fontFamily: 'var(--mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: '.09em',
          textTransform: 'uppercase', color: p.ink, opacity: 0.62,
        }}>{note.cat}</button>
        <div style={{ display: 'flex', gap: 4 }}>
          <button data-no-drag onClick={() => onChange({ ...note, done: !note.done })} title="Mark as run"
            style={{ cursor: 'pointer', width: 22, height: 22, borderRadius: 5, border: `1.5px solid ${p.edge}`, background: note.done ? p.ink : 'transparent', display: 'grid', placeItems: 'center', padding: 0 }}>
            {note.done && <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={p.bg} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.2l2.3 2.3 4.5-4.8" /></svg>}
          </button>
          <button data-no-drag onClick={() => onDelete(note.id)} title="Remove" style={{ cursor: 'pointer', width: 22, height: 22, borderRadius: 5, border: 'none', background: 'transparent', color: p.ink, opacity: 0.5, fontSize: 17, lineHeight: 1, padding: 0 }}>&times;</button>
        </div>
      </div>

      <div
        ref={bodyRef}
        data-no-drag
        contentEditable
        suppressContentEditableWarning
        onBlur={commit}
        style={{
          fontFamily: "'Caveat', var(--sans)", fontSize: 21, lineHeight: 1.22, fontWeight: 600,
          outline: 'none', cursor: 'text', minHeight: 60,
          textDecoration: note.done ? 'line-through rgba(0,0,0,.4)' : 'none',
        }}
      >{note.body}</div>
    </div>
  );
}

function StickyBoard() {
  const [notes, setNotes] = React.useState(loadNotes);
  const [drag, setDrag] = React.useState(null);   // {id, dx, dy}
  const boardRef = React.useRef(null);

  React.useEffect(() => {
    try { localStorage.setItem('tj-sticky-cues', JSON.stringify(notes)); } catch (e) {}
  }, [notes]);

  const update = (n) => setNotes((cur) => cur.map((x) => (x.id === n.id ? n : x)));
  const remove = (id) => setNotes((cur) => cur.filter((x) => x.id !== id));

  const onDragStart = (e, note) => {
    const board = boardRef.current.getBoundingClientRect();
    setDrag({ id: note.id, dx: e.clientX - board.left - note.x, dy: e.clientY - board.top - note.y });
    e.preventDefault();
  };
  React.useEffect(() => {
    if (!drag) return;
    const move = (e) => {
      const board = boardRef.current.getBoundingClientRect();
      let x = e.clientX - board.left - drag.dx;
      let y = e.clientY - board.top - drag.dy;
      x = Math.max(0, Math.min(x, board.width - 196));
      y = Math.max(0, Math.min(y, board.height - 150));
      setNotes((cur) => cur.map((n) => (n.id === drag.id ? { ...n, x, y } : n)));
    };
    const up = () => setDrag(null);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [drag]);

  const addNote = (body = '') => {
    const id = 'n' + Date.now();
    const x = 40 + Math.random() * 360, y = 40 + Math.random() * 150;
    setNotes((cur) => [...cur, {
      id, cat: 'Cue', body, paper: PAPER_KEYS[cur.length % PAPER_KEYS.length],
      x, y, rot: (Math.random() * 6 - 3), done: false,
    }]);
  };

  const runCount = notes.filter((n) => n.done).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, whiteSpace: 'nowrap' }}>
          <Eyebrow style={{ fontSize: 10 }}>Cues on the glass</Eyebrow>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--muted)' }}>{runCount}/{notes.length} run today</span>
        </div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
          {QUICK_CUES.map((q) => (
            <button key={q} onClick={() => addNote(q)} style={{
              cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface)',
              borderRadius: 100, padding: '5px 11px', fontFamily: 'var(--sans)', fontSize: 11.5,
              fontWeight: 500, color: 'var(--body)', whiteSpace: 'nowrap',
            }}>+ {q}</button>
          ))}
          <button onClick={() => addNote('')} style={{
            cursor: 'pointer', border: 'none', background: 'var(--accent)', borderRadius: 100,
            padding: '6px 13px', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600, color: '#06121f', whiteSpace: 'nowrap',
          }}>+ Blank note</button>
        </div>
      </div>

      <div
        ref={boardRef}
        style={{
          position: 'relative', height: 392, borderRadius: 11,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          backgroundImage: 'radial-gradient(var(--hair) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          overflow: 'hidden',
        }}
      >
        {notes.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)' }}>
            No cues posted. Add one from the quick cues above.
          </div>
        )}
        {notes.map((n) => (
          <StickyNote key={n.id} note={n} onChange={update} onDelete={remove} onDragStart={onDragStart} dragging={drag && drag.id === n.id} />
        ))}
      </div>
    </div>
  );
}

window.StickyBoard = StickyBoard;
