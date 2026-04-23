/* global React, Icon, MOCK */
const { useState: useC, useEffect: useCE } = React;

function fmtCmpDur(s) {
  const m = Math.floor(s/60), r = s%60;
  return `${m}:${String(r).padStart(2,'0')}`;
}

function CmpWave({ seed = 1, bars = 80, color }) {
  const heights = React.useMemo(() => {
    const out = []; let s = seed * 9301 + 49297;
    for (let i = 0; i < bars; i++) { s = (s*9301+49297) % 233280; out.push(4 + (s/233280)*40); }
    return out;
  }, [seed, bars]);
  return (
    <div className="cmp-wave">
      {heights.map((h, i) => (
        <span key={i} className="cmp-wave-bar" style={{ height: h+'px', background: color }}/>
      ))}
    </div>
  );
}

// Radar chart comparing all versions across 4 axes (MST/NRG/EFF/QLT)
function Radar({ versions, colors }) {
  const size = 220, cx = size/2, cy = size/2, rMax = 80;
  const axes = ['mst','nrg','eff','qlt'];
  const labels = ['Mastery','Energy','Effect','Quality'];
  const angle = (i) => (-Math.PI/2) + i * (Math.PI*2/4);
  const pt = (i, val) => {
    const r = (val/4) * rMax;
    return [cx + r*Math.cos(angle(i)), cy + r*Math.sin(angle(i))];
  };
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="cmp-radar">
      {[1,2,3,4].map(lvl => (
        <polygon key={lvl} className="cmp-radar-grid"
          points={axes.map((_, i) => pt(i, lvl).join(',')).join(' ')} />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(i, 4);
        return <line key={i} className="cmp-radar-axis" x1={cx} y1={cy} x2={x} y2={y}/>;
      })}
      {labels.map((l, i) => {
        const [x, y] = pt(i, 4.6);
        return <text key={l} x={x} y={y} className="cmp-radar-label" textAnchor="middle" dominantBaseline="middle">{l}</text>;
      })}
      {versions.map((v, vi) => (
        <g key={v.id}>
          <polygon className="cmp-radar-shape"
            style={{ fill: colors[vi], stroke: colors[vi] }}
            points={axes.map((k, i) => pt(i, v[k]).join(',')).join(' ')}/>
          {axes.map((k, i) => {
            const [x, y] = pt(i, v[k]);
            return <circle key={k} cx={x} cy={y} r={3} fill={colors[vi]} stroke="#0c1018" strokeWidth={1.5}/>;
          })}
        </g>
      ))}
    </svg>
  );
}

function RatingBar({ value, max = 4, highlight, color }) {
  return (
    <div className={'cmp-bar' + (highlight ? ' hi':'')}>
      <div className="cmp-bar-track">
        <div className="cmp-bar-fill" style={{ width: (value/max*100)+'%', background: color || 'var(--accent-color)' }}/>
      </div>
      <span className="cmp-bar-val mono">{value}<span className="cmp-bar-max">/{max}</span></span>
    </div>
  );
}

const COL_COLORS = ['#2dd4d4', '#b794f4', '#e8b84a', '#68d391', '#e06450', '#06a4a4'];

function CompareOverlay({ refObj, onClose, onEdit, overrides }) {
  const [highlight, setHighlight] = useC(true);
  const [playing, setPlaying] = useC(null);

  useCE(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const versions = refObj.versions.map(v => ({ ...v, ...(overrides[v.id]||{}) }));

  // find highest values per metric for diff-highlight
  const peaks = ['mst','nrg','eff','qlt','bpm','dur','tracks'].reduce((acc, k) => {
    acc[k] = Math.max(...versions.map(v => v[k]));
    return acc;
  }, {});

  const composite = (v) => (v.mst + v.nrg + v.eff + v.qlt) / 4;
  const bestComposite = Math.max(...versions.map(composite));

  const bandFor = (avg) => {
    const band = Math.min(4, Math.max(1, Math.round(avg)));
    const label = avg >= 3.5 ? 'Release ready' : avg >= 2.5 ? 'Stage ready' : avg >= 1.5 ? 'Needs polish' : 'Draft';
    return { band, label };
  };

  return (
    <div className="cmp-overlay" onClick={onClose}>
      <div className="cmp-sheet" onClick={e => e.stopPropagation()}>
        <div className="cmp-top">
          <div className="cmp-top-l">
            <div className="cmp-top-cover" style={{background: refObj.cover}}>{MOCK.initials(refObj.artist)}</div>
            <div>
              <div className="cmp-top-t">Compare versions <span>· {refObj.title}</span></div>
              <div className="cmp-top-s">{refObj.artist} · {versions.length} versions stacked side-by-side</div>
            </div>
          </div>
          <div style={{flex:1}}/>
          <label className="cmp-toggle">
            <input type="checkbox" checked={highlight} onChange={e => setHighlight(e.target.checked)}/>
            <span/>
            Highlight best per metric
          </label>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <Icon name="close" size={12}/> Close <kbd>Esc</kbd>
          </button>
        </div>

        <div className="cmp-radar-wrap">
          <Radar versions={versions} colors={versions.map((_, i) => COL_COLORS[i % COL_COLORS.length])}/>
          <div className="cmp-legend">
            {versions.map((v, i) => (
              <div key={v.id} className="cmp-legend-row">
                <span className="cmp-legend-sw" style={{background: COL_COLORS[i%COL_COLORS.length]}}/>
                <span className="cmp-legend-n">{v.label}</span>
                <span className="cmp-legend-c mono">{composite(v).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="cmp-grid scroll" style={{gridTemplateColumns: `180px repeat(${versions.length}, minmax(220px, 1fr))`}}>
          {/* Row 0 : column headers */}
          <div className="cmp-cell cmp-row-h"/>
          {versions.map((v, i) => (
            <div key={v.id} className="cmp-cell cmp-col-h" style={{borderTopColor: COL_COLORS[i%COL_COLORS.length]}}>
              <div className="cmp-col-h-top">
                <button className="cmp-play" onClick={() => setPlaying(playing===v.id?null:v.id)} style={{background: COL_COLORS[i%COL_COLORS.length]}}>
                  <Icon name={playing===v.id ? 'pause':'play'} size={11}/>
                </button>
                <div className="cmp-col-h-t-block">
                  <div className="cmp-col-h-t">{v.label || 'untitled'}</div>
                  <div className="cmp-col-h-s mono">{v.id.toUpperCase()}</div>
                </div>
                {v.fav && <span className="cmp-primary"><Icon name="star" size={11}/>PRIMARY</span>}
              </div>
              <CmpWave seed={parseInt(v.id.slice(1),36) || 1} color={COL_COLORS[i%COL_COLORS.length] + '80'}/>
            </div>
          ))}

          {/* Stats rows */}
          {[
            { k:'bpm',   l:'BPM',      fmt:(v) => <span className="mono">{v.bpm}</span>, peak:true },
            { k:'key',   l:'Key',      fmt:(v) => <span className="badge badge-muted mono">{v.key}</span> },
            { k:'dur',   l:'Duration', fmt:(v) => <span className="mono">{fmtCmpDur(v.dur)}</span>, peak:true },
            { k:'genre', l:'Genre',    fmt:(v) => <span className="badge badge-info">{v.genre}</span> },
            { k:'tracks',l:'Tracks',   fmt:(v) => <span className="mono">{v.tracks} file{v.tracks>1?'s':''}</span>, peak:true },
          ].map(row => (
            <React.Fragment key={row.k}>
              <div className="cmp-cell cmp-row-h">{row.l}</div>
              {versions.map((v, i) => (
                <div key={v.id} className={'cmp-cell cmp-stat' + (highlight && row.peak && v[row.k]===peaks[row.k] ? ' peak':'')}>
                  {row.fmt(v)}
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Separator */}
          <div className="cmp-sep" style={{gridColumn: `span ${versions.length+1}`}}>Ratings</div>

          {/* Rating bars */}
          {[
            { k:'mst', l:'Mastery',  c:'var(--accent-color)' },
            { k:'nrg', l:'Energy',   c:'var(--color-warning-light)' },
            { k:'eff', l:'Effect',   c:'var(--color-info-light)' },
            { k:'qlt', l:'Quality',  c:'#68d391' },
          ].map(row => (
            <React.Fragment key={row.k}>
              <div className="cmp-cell cmp-row-h">{row.l}</div>
              {versions.map((v) => (
                <div key={v.id} className="cmp-cell cmp-rating">
                  <RatingBar value={v[row.k]} highlight={highlight && v[row.k]===peaks[row.k]} color={row.c}/>
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Composite */}
          <div className="cmp-sep" style={{gridColumn: `span ${versions.length+1}`}}>Composite</div>
          <div className="cmp-cell cmp-row-h">Score</div>
          {versions.map((v, i) => {
            const c = composite(v);
            const { band, label } = bandFor(c);
            const isBest = highlight && c === bestComposite;
            return (
              <div key={v.id} className={'cmp-cell cmp-composite' + (isBest ? ' best':'')}>
                <div className="cmp-composite-v mono">{c.toFixed(2)}<span>/4</span></div>
                <span className={'cmp-band band-' + band}>{label}</span>
                {isBest && <span className="cmp-best-ribbon">TOP PICK</span>}
              </div>
            );
          })}

          {/* Actions */}
          <div className="cmp-cell cmp-row-h">Actions</div>
          {versions.map((v, i) => (
            <div key={v.id} className="cmp-cell cmp-actions">
              <button className="btn btn-outline btn-sm" onClick={() => { onEdit(v.id); onClose(); }}>
                <Icon name="edit" size={11}/>Edit ratings
              </button>
              <button className="btn btn-ghost btn-sm"><Icon name="show" size={11}/>Add to show</button>
              {!v.fav && <button className="btn btn-ghost btn-sm"><Icon name="star" size={11}/>Set primary</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.CompareOverlay = CompareOverlay;
