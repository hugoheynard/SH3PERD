/* global React, Icon, MOCK */
const { useState: useML, useMemo: useMLM } = React;

const { REFS, GENRES } = window.MOCK;

function Dots({ value, size = 4 }) {
  return (
    <span className="dots">
      {[1,2,3,4].map(d => (
        <span key={d} className="dot" data-filled={d <= value ? '' : undefined} data-level={value} />
      ))}
    </span>
  );
}

function MiniWave({ seed=1, bars=40, active=false }) {
  const heights = useMLM(() => {
    const out = [];
    let s = seed * 9301 + 49297;
    for (let i=0;i<bars;i++) { s = (s*9301+49297) % 233280; out.push(3 + (s/233280)*16); }
    return out;
  }, [seed, bars]);
  return (
    <div className="ver-wave">
      {heights.map((h,i) => (
        <span key={i} className="ver-wave-bar" style={{height: h+'px', background: active && i < 12 ? 'var(--accent-color-light)' : undefined }} />
      ))}
    </div>
  );
}

function fmtDur(s) {
  const m = Math.floor(s/60), r = s%60;
  return `${m}:${String(r).padStart(2,'0')}`;
}

function GenrePills({ selected, onToggle }) {
  return (
    <div className="pill-row">
      {GENRES.map(g => (
        <span key={g} className={'pill' + (selected.has(g) ? ' on':'')} onClick={() => onToggle(g)}>{g}</span>
      ))}
    </div>
  );
}

function RatingFilterRow({ label, value, onChange }) {
  return (
    <div className="rf-row">
      <span className="rf-row-lab">{label}</span>
      <span className="rf-slider">
        {[1,2,3,4].map(l => (
          <span key={l} className={'s' + (value>=l ? ' on':'')} data-level={l} onClick={() => onChange(value===l ? 0 : l)} />
        ))}
      </span>
    </div>
  );
}

function SidePanel({ active }) {
  const [genres, setGenres] = useML(new Set(['Jazz/Soul','Pop','EDM','R&B']));
  const [mst, setMst] = useML(3);
  const [nrg, setNrg] = useML(0);
  const [eff, setEff] = useML(0);

  const toggleG = (g) => {
    const n = new Set(genres);
    n.has(g) ? n.delete(g) : n.add(g);
    setGenres(n);
  };
  return (
    <aside className="ml-side">
      <div className="ml-side-header">
        <div className="ml-side-tab-title">Active tab</div>
        <div className="ml-side-tab-name">
          <span style={{width:8, height:8, borderRadius:'50%', background:'var(--accent-color)', boxShadow:'0 0 6px var(--accent-color)'}}/>
          {active}
        </div>
      </div>

      <div className="ml-side-section scroll" style={{overflowY:'auto'}}>
        <div className="ml-side-h">Library · snapshot <Icon name="more" size={14} style={{color:'var(--text-muted)'}}/></div>
        <div className="stat-grid">
          <div className="stat-tile">
            <div className="stat-tile-num">128</div>
            <div className="stat-tile-label">References</div>
            <div className="stat-tile-delta"><Icon name="arrow-up" size={10}/>+6 this week</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-num">312</div>
            <div className="stat-tile-label">Versions</div>
            <div className="stat-tile-delta"><Icon name="arrow-up" size={10}/>+11</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-num">3.4<span style={{fontSize:12, color:'var(--text-muted)', fontWeight:400}}>/4</span></div>
            <div className="stat-tile-label">Avg mastery</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-num">3.1<span style={{fontSize:12, color:'var(--text-muted)', fontWeight:400}}>/4</span></div>
            <div className="stat-tile-label">Avg quality</div>
          </div>
        </div>
      </div>

      <div className="ml-side-section">
        <div className="ml-side-h">Genres</div>
        <GenrePills selected={genres} onToggle={toggleG} />
      </div>

      <div className="ml-side-section">
        <div className="ml-side-h">Ratings <span className="mono" style={{color:'var(--text-faded)', fontSize:9}}>min</span></div>
        <RatingFilterRow label="MST" value={mst} onChange={setMst} />
        <RatingFilterRow label="NRG" value={nrg} onChange={setNrg} />
        <RatingFilterRow label="EFF" value={eff} onChange={setEff} />
      </div>

      <div className="ml-side-section">
        <div className="ml-side-h">Distribution</div>
        {['Pop','Jazz/Soul','EDM','Rock','R&B'].map((g,i) => (
          <div key={g} style={{marginBottom:8}}>
            <div className="dist-row" style={{padding:'2px 0'}}>
              <span className="dist-row-label"><span style={{width:8,height:8,borderRadius:2,background:['#7c5bbf','#06a4a4','#e06450','#d4a017','#1a9e6a'][i]}}/>{g}</span>
              <span className="dist-row-val">{[28,22,18,14,11][i]}</span>
            </div>
            <div className="dist-bar"><div className="dist-bar-fill" style={{width: [88,70,58,45,36][i]+'%', background: ['#7c5bbf','#06a4a4','#e06450','#d4a017','#1a9e6a'][i] }}/></div>
          </div>
        ))}
      </div>

      <div style={{flex:1}}/>
    </aside>
  );
}

// Interactive dot-rating row — click / hover to set (0..4)
function DotsInput({ value, onChange, accent }) {
  const [hover, setHover] = useML(0);
  const disp = hover || value;
  return (
    <span className="dots-input" onMouseLeave={() => setHover(0)}>
      {[1,2,3,4].map(d => (
        <button
          key={d}
          className="di-dot"
          data-filled={d <= disp ? '' : undefined}
          data-level={disp}
          onMouseEnter={() => setHover(d)}
          onClick={(e) => { e.stopPropagation(); onChange(value === d ? 0 : d); }}
          style={{ '--accent': accent }}
        />
      ))}
      <span className="di-num mono">{disp}</span>
    </span>
  );
}

const GENRE_CHOICES = ['Pop','Rock','EDM','Jazz/Soul','Hip-Hop','R&B','Classical','Folk/Acoustic'];
const KEY_CHOICES = ['C','Cm','C#','C#m','D','Dm','E','Em','F','Fm','F#','F#m','G','Gm','A','Am','Bb','B','Bm'];

// ───── Popover menus (reference + version) ─────
function Popover({ anchorRef, onClose, children, align='right' }) {
  const [pos, setPos] = useML(null);
  const popRef = React.useRef(null);
  React.useLayoutEffect(() => {
    if (!anchorRef.current) return;
    const compute = () => {
      const r = anchorRef.current.getBoundingClientRect();
      // measure popover to decide flip
      const ph = popRef.current ? popRef.current.offsetHeight : 320;
      const spaceBelow = window.innerHeight - r.bottom;
      const spaceAbove = r.top;
      const flipUp = spaceBelow < ph + 12 && spaceAbove > spaceBelow;
      const next = { [align]: align === 'right' ? window.innerWidth - r.right : r.left };
      if (flipUp) {
        // place above the anchor, anchored by its bottom edge
        next.bottom = window.innerHeight - r.top + 6;
        next.maxHeight = Math.max(160, spaceAbove - 16) + 'px';
      } else {
        next.top = r.bottom + 6;
        next.maxHeight = Math.max(160, spaceBelow - 16) + 'px';
      }
      setPos(next);
    };
    compute();
    // re-measure after mount so we get real popover height
    const raf = requestAnimationFrame(compute);
    return () => cancelAnimationFrame(raf);
  }, [anchorRef, align]);
  React.useEffect(() => {
    const onDoc = (e) => {
      if (anchorRef.current && anchorRef.current.contains(e.target)) return;
      onClose();
    };
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onEsc);
    return () => { document.removeEventListener('mousedown', onDoc); window.removeEventListener('keydown', onEsc); };
  }, [anchorRef, onClose]);
  if (!pos) return null;
  return (
    <div ref={popRef} className="pop-menu" style={pos}>
      {children}
    </div>
  );
}

function MenuItem({ icon, label, kbd, danger, onClick, sub, disabled }) {
  return (
    <button className={'pop-item' + (danger?' danger':'') + (disabled?' disabled':'')}
      onClick={() => { if (!disabled) onClick?.(); }}>
      {icon && <span className="pop-ico"><Icon name={icon} size={13}/></span>}
      <span className="pop-lab">{label}{sub && <span className="pop-sub">{sub}</span>}</span>
      {kbd && <span className="pop-kbd mono">{kbd}</span>}
    </button>
  );
}

function MenuSep() { return <div className="pop-sep"/>; }
function MenuHeader({ children }) { return <div className="pop-header">{children}</div>; }

function RefMoreMenu({ anchorRef, r, onClose, onCompare }) {
  const act = (fn) => () => { fn?.(); onClose(); };
  return (
    <Popover anchorRef={anchorRef} onClose={onClose}>
      <MenuHeader>{r.title}<span>· {r.artist}</span></MenuHeader>
      <MenuItem icon="edit"       label="Open reference"        kbd="↵"      onClick={act()}/>
      <MenuItem icon="edit"       label="Edit metadata…"                    onClick={act()}/>
      <MenuItem icon="waveform"   label="Compare versions"       sub={`${r.versions.length} stacked`} onClick={act(onCompare)}/>
      <MenuSep/>
      <MenuItem icon="show"       label="Add to a show…"                    onClick={act()}/>
      <MenuItem icon="plus"       label="New tab with this reference"       onClick={act()}/>
      <MenuItem icon="heart"      label="Mark as favorite"                  onClick={act()}/>
      <MenuSep/>
      <MenuItem icon="list"       label="Duplicate reference"    kbd="⌘D"   onClick={act()}/>
      <MenuItem icon="arrow-down" label="Export all stems"       sub=".wav ∙ .zip" onClick={act()}/>
      <MenuSep/>
      <MenuItem icon="close"      label="Archive"                           onClick={act()}/>
      <MenuItem icon="close"      label="Delete reference"       danger     kbd="⌫" onClick={act()}/>
    </Popover>
  );
}

function MasterPopover({ anchorRef, r, currentId, onPick, onClear, onClose, overrides }) {
  const getView = (v) => ({ ...v, ...(overrides[v.id] || {}) });
  const current = r.versions.find(v => v.fav && v.id === currentId) || r.versions.find(v => v.fav);
  const composite = (v) => ((v.mst + v.nrg + v.eff + v.qlt) / 4).toFixed(2);
  const act = (fn) => () => { fn?.(); onClose(); };

  return (
    <Popover anchorRef={anchorRef} onClose={onClose}>
      <div className="pop-header master-pop-head">
        <div className="master-pop-title">
          <Icon name="star" size={12}/> Master version
        </div>
        <div className="master-pop-cap">Pick the primary cut used in shows, exports and the sidebar snapshot.</div>
      </div>
      {current && (
        <>
          <div className="master-pop-current">
            <span className="master-pop-badge">CURRENT</span>
            <div className="master-pop-current-body">
              <div className="master-pop-current-l">
                <span className="master-pop-star"><Icon name="star" size={11}/></span>
                <span className="master-pop-label">{current.label || 'untitled'}</span>
              </div>
              <span className="mono master-pop-score">{composite(getView(current))}<span>/4</span></span>
            </div>
          </div>
          <MenuSep/>
        </>
      )}
      <div className="master-pop-sec">Switch to</div>
      {r.versions.filter(v => v.id !== (current?.id)).map(v => {
        const view = getView(v);
        return (
          <button key={v.id} className="pop-item master-pop-row" onClick={act(() => onPick(v.id))}>
            <span className="master-pop-row-l">
              <span className="master-pop-row-name">{view.label || 'untitled'}</span>
              <span className="master-pop-row-meta mono">
                {String(Math.floor(view.dur/60))}:{String(view.dur%60).padStart(2,'0')} · {view.bpm}bpm · {view.key}
              </span>
            </span>
            <span className="master-pop-row-r">
              <span className="master-pop-score mono">{composite(view)}<span>/4</span></span>
            </span>
          </button>
        );
      })}
      {r.versions.filter(v => v.id !== (current?.id)).length === 0 && (
        <div className="master-pop-empty">No other versions yet.</div>
      )}
      {current && (
        <>
          <MenuSep/>
          <MenuItem icon="close" label="Clear primary" sub="No version pinned" onClick={act(onClear)}/>
        </>
      )}
    </Popover>
  );
}

function VerMoreMenu({ anchorRef, v, onEdit, onClose }) {
  const act = (fn) => () => { fn?.(); onClose(); };
  return (
    <Popover anchorRef={anchorRef} onClose={onClose}>
      <MenuHeader>{v.label || 'untitled'}<span className="mono">· {v.bpm}bpm · {v.key}</span></MenuHeader>
      <MenuItem icon="play"       label="Play version"           kbd="Space" onClick={act()}/>
      <MenuItem icon="star"       label={v.fav ? 'Unpin as primary' : 'Set as primary'} onClick={act()}/>
      <MenuItem icon="edit"       label="Edit ratings & metadata" kbd="E"    onClick={act(() => onEdit(v.id))}/>
      <MenuSep/>
      <MenuItem icon="waveform"   label="Master this version"               onClick={act()}/>
      <MenuItem icon="list"       label="Duplicate as new version" kbd="⌘D" onClick={act()}/>
      <MenuItem icon="show"       label="Move to another reference…"        onClick={act()}/>
      <MenuSep/>
      <MenuItem icon="arrow-down" label="Export tracks"          sub={`${v.tracks} file${v.tracks>1?'s':''}`} onClick={act()}/>
      <MenuItem icon="contracts"  label="Copy version link"      kbd="⌘⇧C"  onClick={act()}/>
      <MenuSep/>
      <MenuItem icon="close"      label="Archive version"                   onClick={act()}/>
      <MenuItem icon="close"      label="Delete version"         danger     kbd="⌫" onClick={act()}/>
    </Popover>
  );
}

function VersionEditor({ draft, setDraft, onCancel, onSave, dirty }) {
  // Keyboard shortcuts
  React.useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
      else if ((e.key === 'Enter' && (e.metaKey||e.ctrlKey)) || (e.key==='s' && (e.metaKey||e.ctrlKey))) {
        e.preventDefault(); if (dirty) onSave();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onSave, onCancel, dirty]);

  const set = (k, v) => setDraft({ ...draft, [k]: v });
  const avg = ((draft.mst+draft.nrg+draft.eff+draft.qlt)/4).toFixed(2);

  return (
    <div className="ver-edit">
      <div className="ver-edit-bar">
        <span className="ver-edit-bar-t">Editing version</span>
        <span className="ver-edit-bar-path mono">{draft.id} · {draft.label || 'untitled'}</span>
        <span className={'ver-edit-dirty' + (dirty ? ' on':'')}>{dirty ? '● unsaved' : '✓ saved'}</span>
        <span style={{flex:1}}/>
        <span className="ver-edit-kbd"><kbd>Esc</kbd> cancel</span>
        <span className="ver-edit-kbd"><kbd>⌘</kbd><kbd>↵</kbd> save</span>
      </div>

      <div className="ver-edit-body">
        {/* Metadata column */}
        <div className="ve-col">
          <div className="ve-col-h">Metadata</div>

          <label className="ve-field ve-field-wide">
            <span className="ve-lab">Version label</span>
            <input
              className="ve-input"
              value={draft.label}
              autoFocus
              onChange={(e) => set('label', e.target.value)}
              placeholder="e.g. Studio, Acoustic, Club remix…"
            />
          </label>

          <div className="ve-grid">
            <label className="ve-field">
              <span className="ve-lab">Genre</span>
              <div className="ve-chipset">
                {GENRE_CHOICES.map(g => (
                  <button key={g} type="button"
                    className={'ve-chip' + (draft.genre===g ? ' on':'')}
                    onClick={() => set('genre', g)}>{g}</button>
                ))}
              </div>
            </label>
          </div>

          <div className="ve-grid ve-grid-3">
            <label className="ve-field">
              <span className="ve-lab">Key</span>
              <select className="ve-input mono" value={draft.key} onChange={(e)=> set('key', e.target.value)}>
                {KEY_CHOICES.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </label>
            <label className="ve-field">
              <span className="ve-lab">BPM</span>
              <div className="ve-stepper">
                <button type="button" onClick={() => set('bpm', Math.max(40, draft.bpm-1))}>−</button>
                <input className="ve-input mono" type="number" value={draft.bpm}
                  onChange={(e) => set('bpm', Math.max(40, Math.min(240, +e.target.value||0)))}/>
                <button type="button" onClick={() => set('bpm', Math.min(240, draft.bpm+1))}>+</button>
              </div>
            </label>
            <label className="ve-field">
              <span className="ve-lab">Duration</span>
              <div className="ve-dur-edit">
                <input className="ve-input mono" type="number" min={0}
                  value={Math.floor(draft.dur/60)}
                  onChange={(e) => set('dur', Math.max(0, (+e.target.value||0)*60 + (draft.dur%60)))}/>
                <span className="ve-dur-sep">:</span>
                <input className="ve-input mono" type="number" min={0} max={59}
                  value={String(draft.dur%60).padStart(2,'0')}
                  onChange={(e) => set('dur', Math.floor(draft.dur/60)*60 + Math.max(0, Math.min(59, +e.target.value||0)))}/>
              </div>
            </label>
          </div>

          <label className="ve-field-inline">
            <button type="button"
              className={'ve-toggle' + (draft.fav ? ' on':'')}
              onClick={() => set('fav', !draft.fav)}>
              <Icon name="star" size={12}/>
              {draft.fav ? 'Favorite' : 'Mark as favorite'}
            </button>
            <span className="ve-hint">Shown as ★ on the row</span>
          </label>
        </div>

        {/* Ratings column */}
        <div className="ve-col ve-col-ratings">
          <div className="ve-col-h">Ratings <span className="ve-col-h-hint">click a dot · click again to clear</span></div>

          {[
            {k:'mst', l:'Mastery',      d:'How polished is the production',    c:'var(--accent-color)'},
            {k:'nrg', l:'Energy',       d:'Perceived intensity for the crowd', c:'var(--color-warning-light)'},
            {k:'eff', l:'Effect',       d:'Emotional or dramatic impact',      c:'var(--color-info-light)'},
            {k:'qlt', l:'Overall quality', d:'Release-ready confidence',       c:'#68d391'},
          ].map(x => (
            <div className="ve-rating-row" key={x.k}>
              <div className="ve-rating-meta">
                <span className="ve-rating-l">{x.l}</span>
                <span className="ve-rating-d">{x.d}</span>
              </div>
              <DotsInput value={draft[x.k]} onChange={(v) => set(x.k, v)} accent={x.c}/>
            </div>
          ))}

          <div className="ve-avg">
            <span className="ve-avg-l">Composite</span>
            <span className="ve-avg-v mono">{avg}<span className="ve-avg-max">/4</span></span>
            <span className={'ve-avg-band band-' + (Math.round((draft.mst+draft.nrg+draft.eff+draft.qlt)/4) || 1)}>
              {avg >= 3.5 ? 'Release ready' : avg >= 2.5 ? 'Stage ready' : avg >= 1.5 ? 'Needs polish' : 'Draft'}
            </span>
          </div>
        </div>
      </div>

      <div className="ver-edit-footer">
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={!dirty} onClick={onSave}>
          {dirty ? 'Save changes' : 'No changes'}
        </button>
      </div>
    </div>
  );
}

function RefCard({ r, expanded, onToggle, playing, onPlay, editing, onEdit, onSave, onCancel, overrides, onCompare, onMaster, onProcess }) {
  const [draft, setDraft] = useML(null);
  const [menuOpen, setMenuOpen] = useML(null); // ref | versionId | null
  const [masterOpen, setMasterOpen] = useML(null); // versionId | null
  const refMoreRef = React.useRef(null);
  const verMoreRefs = React.useRef({});
  const verMasterRefs = React.useRef({});

  // Initialise draft when an edit opens on one of OUR versions
  React.useEffect(() => {
    const open = r.versions.find(v => v.id === editing);
    if (open) {
      const merged = { ...open, ...(overrides[open.id] || {}) };
      setDraft({ ...merged });
    } else setDraft(null);
  }, [editing, r, overrides]);

  const getView = (v) => {
    // Live view: if this is the version being edited, show draft values
    if (editing === v.id && draft) return draft;
    return { ...v, ...(overrides[v.id] || {}) };
  };

  const dirty = draft && (() => {
    const base = { ...r.versions.find(v=>v.id===draft.id), ...(overrides[draft.id]||{}) };
    return ['label','genre','key','bpm','dur','fav','mst','nrg','eff','qlt']
      .some(k => base[k] !== draft[k]);
  })();

  return (
    <div className="ref-card">
      <div className="ref-head">
        <div className="ref-cover" style={{background:r.cover}}>{MOCK.initials(r.artist)}</div>
        <div className="ref-title-block">
          <div className="ref-title">{r.title}</div>
          <div className="ref-artist">{r.artist} · {r.versions.length} version{r.versions.length>1?'s':''}</div>
        </div>
        <div className="ref-head-meta">
          <span className="badge badge-muted mono">{getView(r.versions[0]).key}</span>
          <div className="ref-avg">
            <div>
              <div className="ref-avg-val">{(r.versions.reduce((a,v)=>a+getView(v).qlt,0)/r.versions.length).toFixed(1)}</div>
              <div className="ref-avg-lab">Avg QLT</div>
            </div>
          </div>
          <button className="icon-btn" title="Favorite"><Icon name="heart" size={16}/></button>
          <button
            ref={refMoreRef}
            className={'icon-btn' + (menuOpen==='ref' ? ' active':'')}
            title="More"
            onClick={() => setMenuOpen(menuOpen==='ref' ? null : 'ref')}>
            <Icon name="more" size={16}/>
          </button>
          {menuOpen==='ref' && <RefMoreMenu anchorRef={refMoreRef} r={r} onClose={() => setMenuOpen(null)} onCompare={() => onCompare(r.id)}/>}
        </div>
      </div>

      <div className="ref-versions">
        {r.versions.map(vRaw => {
          const v = getView(vRaw);
          const isEditing = editing === v.id;
          return (
            <React.Fragment key={v.id}>
              <div className={'ver-row' + (isEditing ? ' editing':'')}>
                <button className="ver-play" onClick={() => onPlay(v.id)}>
                  <Icon name={playing===v.id ? 'pause':'play'} size={10}/>
                </button>
                <div className="ver-label">
                  {v.fav && <Icon name="star" size={11} style={{color:'var(--color-warning-light)'}}/>}
                  <span className="ver-label-name">{v.label || <span style={{color:'var(--text-faded)', fontStyle:'italic'}}>untitled</span>}</span>
                  <span className="badge badge-info">{v.genre}</span>
                </div>
                <div className="ver-dur mono">{fmtDur(v.dur)}</div>
                <MiniWave seed={parseInt(v.id.slice(1),36)||1} active={playing===v.id} />
                <div className="ver-bpm mono"><strong>{v.bpm}</strong>bpm<span className="ver-bpm-key">{v.key}</span></div>
                <button className="badge badge-muted" onClick={() => onToggle(v.id)} style={{cursor:'pointer'}}>
                  {v.tracks} track{v.tracks>1?'s':''} <Icon name="chev-r" size={10} style={{transform: expanded===v.id?'rotate(90deg)':'none', marginLeft:2}}/>
                </button>
                <div className="ver-ratings">
                  {[{l:'MST', v:v.mst},{l:'NRG', v:v.nrg},{l:'EFF', v:v.eff},{l:'QLT', v:v.qlt}].map(x => (
                    <div className="rg" key={x.l}>
                      <span className="rg-lab">{x.l}</span>
                      <Dots value={x.v}/>
                    </div>
                  ))}
                </div>
                <div className="ver-actions">
                  <button
                    ref={el => { if (el) verMasterRefs.current[v.id] = { current: el }; }}
                    className={'icon-btn' + (v.fav ? ' master-on':'') + (masterOpen===v.id ? ' active':'')}
                    title={v.fav ? 'Primary version — click to change' : 'Set as primary version'}
                    onClick={(e) => { e.stopPropagation(); setMasterOpen(masterOpen===v.id ? null : v.id); }}>
                    <Icon name="star" size={14}/>
                  </button>
                  {masterOpen===v.id && verMasterRefs.current[v.id] && (
                    <MasterPopover
                      anchorRef={verMasterRefs.current[v.id]}
                      r={r}
                      currentId={r.versions.find(x => x.fav)?.id}
                      overrides={overrides}
                      onPick={(id) => onMaster(r.id, id)}
                      onClear={() => onMaster(r.id, null)}
                      onClose={() => setMasterOpen(null)}/>
                  )}
                  <button
                    className="icon-btn"
                    title="Open audio processing"
                    onClick={(e) => { e.stopPropagation(); onProcess(r.id, v.id); }}>
                    <Icon name="waveform" size={14}/>
                  </button>
                  <button
                    className={'icon-btn' + (isEditing ? ' active':'')}
                    title={isEditing ? 'Close editor' : 'Edit version'}
                    onClick={() => onEdit(isEditing ? null : v.id)}>
                    <Icon name="edit" size={13}/>
                  </button>
                  <button
                    ref={el => { if (el) verMoreRefs.current[v.id] = { current: el }; }}
                    className={'icon-btn' + (menuOpen===v.id ? ' active':'')}
                    title="More"
                    onClick={() => setMenuOpen(menuOpen===v.id ? null : v.id)}>
                    <Icon name="more" size={14}/>
                  </button>
                  {menuOpen===v.id && verMoreRefs.current[v.id] && (
                    <VerMoreMenu anchorRef={verMoreRefs.current[v.id]} v={v} onEdit={onEdit} onClose={() => setMenuOpen(null)}/>
                  )}
                </div>
              </div>

              {isEditing && draft && (
                <VersionEditor
                  draft={draft}
                  setDraft={setDraft}
                  dirty={dirty}
                  onCancel={onCancel}
                  onSave={() => onSave(draft)}
                />
              )}

              {!isEditing && expanded===v.id && (
                <div className="ver-tracks">
                  {[0,1,2].slice(0, v.tracks).map(i => (
                    <div key={i} className="trk-row">
                      <span className={'trk-fav' + (i!==0 ? ' off':'')}><Icon name="star" size={11}/></span>
                      <span className="trk-name mono">{(v.label||'v').toLowerCase().replace(/\s+/g,'-')}_v{i+1}.wav</span>
                      <span className="mono">{fmtDur(v.dur + i*3 - 5)}</span>
                      <span className="mono">44.1k</span>
                      <span className="trk-q" data-level={v.qlt}>Q{v.qlt}</span>
                      <button className="icon-btn"><Icon name="more" size={12}/></button>
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <button className="ref-add">
        <Icon name="plus" size={12}/> Add version
      </button>
    </div>
  );
}

function PageMusic() {
  const [tabs] = useML([
    { id:'t1', title:'Festival 2026', count:34, active:false },
    { id:'t2', title:'Top quality',    count:22, active:false },
    { id:'t3', title:'Headliners',     count:12, active:true  },
    { id:'t4', title:'To master',      count: 8, active:false },
    { id:'t5', title:'Léo Vasquez',    count: 3, active:false },
  ]);
  const [activeTab, setActiveTab] = useML('t3');
  const [expanded, setExpanded] = useML('v2a');
  const [playing, setPlaying] = useML(null);
  const [view, setView] = useML('cards');
  const [editing, setEditing] = useML(null);
  const [overrides, setOverrides] = useML({}); // { [versionId]: partial }
  const [compareId, setCompareId] = useML(null);
  const [processing, setProcessing] = useML(null); // { refId, versionId } | null

  const onEdit = (id) => {
    setEditing(id);
    if (id) setExpanded(null); // collapse tracks while editing
  };
  const onSaveDraft = (draft) => {
    setOverrides({ ...overrides, [draft.id]: draft });
    setEditing(null);
  };
  const onCancelEdit = () => setEditing(null);

  const onMaster = (refId, versionId) => {
    const ref = REFS.find(x => x.id === refId);
    if (!ref) return;
    const next = { ...overrides };
    ref.versions.forEach(v => {
      const current = { ...v, ...(next[v.id] || {}) };
      const shouldBeFav = v.id === versionId;
      if (current.fav !== shouldBeFav) {
        next[v.id] = { ...next[v.id], fav: shouldBeFav };
      }
    });
    setOverrides(next);
  };

  const activeTabName = tabs.find(t => t.id === activeTab)?.title || '';

  return (
    <div className="ml-root">
      <div className="ml-tabs">
        {tabs.map(t => (
          <div key={t.id} className={'ml-tab' + (activeTab===t.id ? ' active':'')} onClick={() => setActiveTab(t.id)}>
            <span className="ml-tab-dot"/>
            {t.title}
            <span className="ml-tab-count">{t.count}</span>
            <span className="ml-tab-close"><Icon name="close" size={9}/></span>
          </div>
        ))}
        <button className="ml-tab-add" title="New tab"><Icon name="plus" size={12}/></button>
        <div className="ml-tabs-search">
          <Icon name="search" size={12}/>
          <input placeholder="Search…" defaultValue=""/>
        </div>
      </div>

      <div className="ml-body">
        <SidePanel active={activeTabName}/>
        <div className="ml-main">
          <div className="ml-toolbar">
            <span className="ml-toolbar-count"><strong>{REFS.length}</strong> references · <strong>17</strong> versions</span>
            <span className="badge badge-accent">Filtered by tab</span>
            <div className="ml-toolbar-actions">
              <button className="sort-btn">Sort: <span style={{color:'var(--text-primary)'}}>QLT desc</span> <Icon name="chev-d" size={10}/></button>
              <button className="btn btn-ghost btn-sm"><Icon name="filter" size={12}/>Filters</button>
              <button className="btn btn-primary btn-sm"><Icon name="plus" size={12}/>Add song</button>
              <div className="view-toggle">
                <button className={view==='cards'?'on':''} onClick={() => setView('cards')}><Icon name="grid" size={12}/></button>
                <button className={view==='table'?'on':''} onClick={() => setView('table')}><Icon name="list" size={12}/></button>
              </div>
            </div>
          </div>
          <div className="ml-results scroll">
            {REFS.map(r => (
              <RefCard key={r.id} r={r} expanded={expanded}
                onToggle={(id) => setExpanded(expanded===id ? null : id)}
                playing={playing} onPlay={(id) => setPlaying(playing===id ? null : id)}
                editing={editing} onEdit={onEdit} onSave={onSaveDraft} onCancel={onCancelEdit}
                overrides={overrides} onCompare={setCompareId} onMaster={onMaster}
                onProcess={(refId, versionId) => setProcessing({ refId, versionId })} />
            ))}
          </div>
        </div>
      </div>
      {compareId && (() => {
        const refObj = REFS.find(x => x.id === compareId);
        const Overlay = window.CompareOverlay;
        return refObj && Overlay ? (
          <Overlay
            refObj={refObj}
            overrides={overrides}
            onClose={() => setCompareId(null)}
            onEdit={(vid) => { setCompareId(null); setEditing(vid); }}
          />
        ) : null;
      })()}
      {processing && (() => {
        const refObj = REFS.find(x => x.id === processing.refId);
        const ver = refObj?.versions.find(v => v.id === processing.versionId);
        const Overlay = window.AudioProcessing;
        return refObj && ver && Overlay ? (
          <Overlay
            refObj={refObj}
            version={ver}
            overrides={overrides}
            onClose={() => setProcessing(null)}
            onApply={(vid) => {
              // mark this version with a "processed" flag (non-destructive stub)
              setOverrides({ ...overrides, [vid]: { ...(overrides[vid]||{}), processed: true } });
            }}
          />
        ) : null;
      })()}
    </div>
  );
}

window.PageMusic = PageMusic;
