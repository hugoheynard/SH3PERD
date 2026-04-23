/* global React, Icon, MOCK */
const { useState: useP, useEffect: usePE, useMemo: usePM } = React;

// Presets for mastering
const MASTER_PRESETS = [
  { id: 'club',      label: 'Club',        sub: 'Festival, big rooms',       lufs: -7,  ceil: -0.3, width: 115 },
  { id: 'radio',     label: 'Radio',       sub: 'Streaming + FM ready',      lufs: -10, ceil: -1.0, width: 100 },
  { id: 'cinematic', label: 'Cinematic',   sub: 'Wide dynamic range',        lufs: -16, ceil: -1.5, width: 120 },
  { id: 'vinyl',     label: 'Vinyl',       sub: 'Warm, low-end rolloff',     lufs: -14, ceil: -2.0, width: 90 },
  { id: 'reference', label: 'Reference',   sub: 'Match to ref track…',       lufs: -9,  ceil: -1.0, width: 105 },
];

const REVERB_TYPES = ['Room', 'Hall', 'Plate', 'Spring', 'Cathedral'];
const DELAY_DIVS   = ['1/4', '1/4 dot', '1/8', '1/8 dot', '1/16'];
const SAT_TYPES    = ['Tape', 'Tube', 'Digital', 'Transistor'];

function BigWave({ seed = 1, bars = 140, active }) {
  const heights = React.useMemo(() => {
    const out = []; let s = seed * 9301 + 49297;
    for (let i = 0; i < bars; i++) { s = (s*9301+49297) % 233280; out.push(6 + (s/233280)*80); }
    return out;
  }, [seed, bars]);
  return (
    <div className="ap-wave">
      {heights.map((h, i) => (
        <span key={i} className={'ap-wave-bar' + (active==='proc' ? ' processed':'')} style={{ height: h+'px' }}/>
      ))}
    </div>
  );
}

function Slider({ label, value, min, max, step = 1, unit, onChange, marks }) {
  return (
    <div className="ap-slider">
      <div className="ap-slider-head">
        <span className="ap-slider-lab">{label}</span>
        <span className="ap-slider-val mono">{value > 0 && min < 0 ? '+' : ''}{value}{unit && <span>{unit}</span>}</span>
      </div>
      <input type="range" className="ap-slider-input" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)}/>
      {marks && (
        <div className="ap-slider-marks">
          {marks.map(m => <span key={m}>{m}</span>)}
        </div>
      )}
    </div>
  );
}

function Toggle({ checked, onChange, label, sub }) {
  return (
    <label className="ap-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}/>
      <span className="ap-toggle-knob"/>
      <span className="ap-toggle-lab">
        <span>{label}</span>
        {sub && <em>{sub}</em>}
      </span>
    </label>
  );
}

function AudioProcessing({ refObj, version, onClose, overrides, onApply }) {
  const view = { ...version, ...(overrides[version.id] || {}) };

  // State for all processing params
  const [tab, setTab] = useP('master');
  const [compare, setCompare] = useP('proc'); // 'orig' | 'proc'
  const [playing, setPlaying] = useP(false);

  // Mastering
  const [preset, setPreset] = useP('radio');
  const p0 = MASTER_PRESETS.find(x => x.id === preset);
  const [lufs,  setLufs]  = useP(p0.lufs);
  const [ceil,  setCeil]  = useP(p0.ceil);
  const [width, setWidth] = useP(p0.width);
  usePE(() => {
    const p = MASTER_PRESETS.find(x => x.id === preset);
    setLufs(p.lufs); setCeil(p.ceil); setWidth(p.width);
  }, [preset]);

  // Pitch & time
  const [semis, setSemis]       = useP(0);
  const [keyOv, setKeyOv]       = useP(view.key);
  const [tempo, setTempo]       = useP(view.bpm);
  const [formants, setFormants] = useP(true);

  // EQ & dynamics
  const [eqLow,  setEqLow]  = useP(0);
  const [eqMid,  setEqMid]  = useP(0);
  const [eqHigh, setEqHigh] = useP(0);
  const [comp,   setComp]   = useP(35);
  const [gate,   setGate]   = useP(false);

  // Effects
  const [fxOn, setFxOn] = useP({ reverb: false, delay: false, sat: true, deess: true });
  const [reverbType, setReverbType] = useP('Hall');
  const [reverbWet,  setReverbWet]  = useP(18);
  const [delayDiv,   setDelayDiv]   = useP('1/8');
  const [delayFb,    setDelayFb]    = useP(22);
  const [satType,    setSatType]    = useP('Tape');
  const [satAmt,     setSatAmt]     = useP(15);

  usePE(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); if (e.code === 'Space') { e.preventDefault(); setPlaying(p => !p); } };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  // Render cost estimate
  const cost = usePM(() => {
    let t = 8; // base
    if (tab === 'master') t += 4;
    if (semis !== 0 || tempo !== view.bpm) t += 12;
    if (fxOn.reverb) t += 6;
    if (fxOn.delay) t += 3;
    if (fxOn.sat) t += 2;
    return t;
  }, [tab, semis, tempo, view.bpm, fxOn]);

  const seed = parseInt(version.id.slice(1), 36) || 1;

  const tabs = [
    { id: 'master',  icon: 'waveform',   label: 'Mastering' },
    { id: 'pitch',   icon: 'up-down',    label: 'Pitch & Time' },
    { id: 'eq',      icon: 'chart',      label: 'EQ & Dynamics' },
    { id: 'fx',      icon: 'star',       label: 'Effects' },
  ];

  return (
    <div className="ap-overlay" onClick={onClose}>
      <div className="ap-sheet" onClick={e => e.stopPropagation()}>
        {/* Top bar */}
        <div className="ap-top">
          <div className="ap-top-l">
            <div className="ap-top-cover" style={{background: refObj.cover}}>{MOCK.initials(refObj.artist)}</div>
            <div>
              <div className="ap-top-t">
                Audio processing
                <span className="ap-top-chip"><Icon name="waveform" size={10}/>Non-destructive</span>
              </div>
              <div className="ap-top-s">
                {refObj.title} — <strong>{view.label || 'untitled'}</strong> · {view.bpm}bpm · {view.key} · {Math.floor(view.dur/60)}:{String(view.dur%60).padStart(2,'0')}
              </div>
            </div>
          </div>
          <div style={{flex:1}}/>
          <div className="ap-ab">
            <button className={compare==='orig' ? 'on':''} onClick={() => setCompare('orig')}>A · Original</button>
            <button className={compare==='proc' ? 'on':''} onClick={() => setCompare('proc')}>B · Processed</button>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <Icon name="close" size={12}/>Close <kbd>Esc</kbd>
          </button>
        </div>

        <div className="ap-body">
          {/* Left — waveform + meters */}
          <div className="ap-left">
            <div className="ap-wave-card">
              <div className="ap-wave-head">
                <button className="ap-play" onClick={() => setPlaying(!playing)}>
                  <Icon name={playing ? 'pause' : 'play'} size={14}/>
                </button>
                <div className="ap-play-meta">
                  <div className="ap-play-t">{compare==='orig' ? 'Original' : 'Processed preview'}</div>
                  <div className="ap-play-s mono">0:24 / {Math.floor(view.dur/60)}:{String(view.dur%60).padStart(2,'0')}</div>
                </div>
                <div className="ap-wave-spacer"/>
                <span className="ap-lufs mono">
                  <span className="ap-lufs-n">{compare==='orig' ? -14.2 : lufs.toFixed(1)}</span>
                  <span className="ap-lufs-u">LUFS</span>
                </span>
              </div>
              <BigWave seed={seed} active={compare}/>
              <div className="ap-wave-foot">
                <div className="ap-meter-row">
                  <span className="ap-meter-lab">L</span>
                  <div className="ap-meter"><div className="ap-meter-fill" style={{width: (compare==='proc' ? 78 : 62) + '%'}}/></div>
                  <span className="ap-meter-val mono">{compare==='proc' ? '-4.2' : '-7.1'} dB</span>
                </div>
                <div className="ap-meter-row">
                  <span className="ap-meter-lab">R</span>
                  <div className="ap-meter"><div className="ap-meter-fill" style={{width: (compare==='proc' ? 75 : 60) + '%'}}/></div>
                  <span className="ap-meter-val mono">{compare==='proc' ? '-4.6' : '-7.4'} dB</span>
                </div>
              </div>
            </div>

            <div className="ap-specgrid">
              <div className="ap-spec-card">
                <div className="ap-spec-lab">Dynamic range</div>
                <div className="ap-spec-v mono">{compare==='proc' ? 'DR7' : 'DR12'}</div>
                <div className="ap-spec-sub">{compare==='proc' ? 'Loud / compressed' : 'Natural'}</div>
              </div>
              <div className="ap-spec-card">
                <div className="ap-spec-lab">Peak</div>
                <div className="ap-spec-v mono">{compare==='proc' ? ceil.toFixed(1) : '-3.2'} dB</div>
                <div className="ap-spec-sub">True peak</div>
              </div>
              <div className="ap-spec-card">
                <div className="ap-spec-lab">Stereo</div>
                <div className="ap-spec-v mono">{compare==='proc' ? width : 100}%</div>
                <div className="ap-spec-sub">Width</div>
              </div>
              <div className="ap-spec-card">
                <div className="ap-spec-lab">Tracks</div>
                <div className="ap-spec-v mono">{view.tracks}</div>
                <div className="ap-spec-sub">Stems loaded</div>
              </div>
            </div>
          </div>

          {/* Right — processing panel */}
          <div className="ap-right">
            <div className="ap-tabs">
              {tabs.map(t => (
                <button key={t.id}
                  className={'ap-tab' + (tab===t.id ? ' on':'')}
                  onClick={() => setTab(t.id)}>
                  <Icon name={t.icon} size={12}/>{t.label}
                </button>
              ))}
            </div>

            <div className="ap-panel scroll">
              {tab === 'master' && (
                <div className="ap-section">
                  <div className="ap-section-h">Preset</div>
                  <div className="ap-preset-grid">
                    {MASTER_PRESETS.map(p => (
                      <button key={p.id}
                        className={'ap-preset' + (preset===p.id ? ' on':'')}
                        onClick={() => setPreset(p.id)}>
                        <div className="ap-preset-t">{p.label}</div>
                        <div className="ap-preset-s">{p.sub}</div>
                        <div className="ap-preset-meta mono">{p.lufs} LUFS</div>
                      </button>
                    ))}
                  </div>

                  <div className="ap-section-h">Targets</div>
                  <Slider label="LUFS target"      value={lufs}  min={-23} max={-5}  unit=" LUFS" onChange={setLufs}
                    marks={['-23','Radio','Club']}/>
                  <Slider label="Ceiling"          value={ceil}  min={-3}  max={-0.1} step={0.1} unit=" dBFS" onChange={setCeil}/>
                  <Slider label="Stereo width"     value={width} min={50}  max={140} unit="%" onChange={setWidth}/>

                  <div className="ap-section-h">Reference track</div>
                  <button className="ap-pick">
                    <Icon name="waveform" size={12}/>
                    <span>Drop a reference or pick from library…</span>
                    <Icon name="chev-d" size={10}/>
                  </button>
                </div>
              )}

              {tab === 'pitch' && (
                <div className="ap-section">
                  <div className="ap-section-h">Pitch shift</div>
                  <Slider label="Semitones" value={semis} min={-12} max={12} unit=" st" onChange={setSemis}
                    marks={['-12','−6','0','+6','+12']}/>
                  <div className="ap-row">
                    <div className="ap-field">
                      <label>Key override</label>
                      <select className="ap-select" value={keyOv} onChange={e => setKeyOv(e.target.value)}>
                        {['C','Cm','C#','C#m','D','Dm','E','Em','F','Fm','F#','F#m','G','Gm','A','Am','Bb','B','Bm'].map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                    <div className="ap-field">
                      <label>Algorithm</label>
                      <select className="ap-select" defaultValue="pro">
                        <option value="pro">Elastique Pro</option>
                        <option value="poly">Polyphonic</option>
                        <option value="mono">Monophonic</option>
                      </select>
                    </div>
                  </div>

                  <div className="ap-section-h">Time stretch</div>
                  <Slider label="Tempo" value={tempo} min={view.bpm - 30} max={view.bpm + 30} unit=" bpm" onChange={setTempo}
                    marks={[(view.bpm-30),'original',(view.bpm+30)]}/>
                  <div className="ap-row">
                    <Toggle checked={formants}   onChange={setFormants} label="Preserve formants" sub="Keeps vocal timbre natural"/>
                  </div>

                  <div className="ap-callout">
                    <Icon name="info" size={12}/>
                    <span>Large shifts ({'>'}±5 st) may introduce artifacts. Try splitting into stems first.</span>
                  </div>
                </div>
              )}

              {tab === 'eq' && (
                <div className="ap-section">
                  <div className="ap-section-h">3-band EQ</div>
                  <div className="ap-eq-row">
                    <Slider label="Low · 80Hz"   value={eqLow}  min={-12} max={12} step={0.5} unit=" dB" onChange={setEqLow}/>
                    <Slider label="Mid · 1kHz"   value={eqMid}  min={-12} max={12} step={0.5} unit=" dB" onChange={setEqMid}/>
                    <Slider label="High · 8kHz"  value={eqHigh} min={-12} max={12} step={0.5} unit=" dB" onChange={setEqHigh}/>
                  </div>

                  <div className="ap-section-h">Dynamics</div>
                  <Slider label="Compression amount" value={comp} min={0} max={100} unit="%" onChange={setComp}
                    marks={['off','gentle','glue','heavy']}/>
                  <div className="ap-row">
                    <Toggle checked={gate} onChange={setGate} label="Noise gate" sub="Removes hiss below threshold"/>
                  </div>

                  <div className="ap-spec-card ap-spec-card-wide">
                    <div className="ap-spec-lab">Spectrum snapshot</div>
                    <div className="ap-spectrum">
                      {Array.from({length: 48}).map((_, i) => {
                        const base = 20 + Math.sin(i * 0.4 + seed) * 15 + Math.cos(i * 0.11) * 10;
                        const shaped = base + (i < 16 ? eqLow * 1.5 : i < 32 ? eqMid * 1.5 : eqHigh * 1.5);
                        return <span key={i} className="ap-spec-bar" style={{height: Math.max(4, shaped + 30) + '%'}}/>;
                      })}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'fx' && (
                <div className="ap-section">
                  <div className="ap-section-h">Reverb</div>
                  <Toggle checked={fxOn.reverb} onChange={v => setFxOn({...fxOn, reverb: v})} label="Enable reverb"/>
                  <div className={'ap-fx-body' + (fxOn.reverb ? '' : ' off')}>
                    <div className="ap-chips">
                      {REVERB_TYPES.map(t => (
                        <button key={t} className={'ap-chip' + (reverbType===t ? ' on':'')} onClick={() => setReverbType(t)}>{t}</button>
                      ))}
                    </div>
                    <Slider label="Wet" value={reverbWet} min={0} max={100} unit="%" onChange={setReverbWet}/>
                  </div>

                  <div className="ap-section-h">Delay</div>
                  <Toggle checked={fxOn.delay} onChange={v => setFxOn({...fxOn, delay: v})} label="Enable delay"/>
                  <div className={'ap-fx-body' + (fxOn.delay ? '' : ' off')}>
                    <div className="ap-chips">
                      {DELAY_DIVS.map(t => (
                        <button key={t} className={'ap-chip mono' + (delayDiv===t ? ' on':'')} onClick={() => setDelayDiv(t)}>{t}</button>
                      ))}
                    </div>
                    <Slider label="Feedback" value={delayFb} min={0} max={80} unit="%" onChange={setDelayFb}/>
                  </div>

                  <div className="ap-section-h">Saturation</div>
                  <Toggle checked={fxOn.sat} onChange={v => setFxOn({...fxOn, sat: v})} label="Enable saturation"/>
                  <div className={'ap-fx-body' + (fxOn.sat ? '' : ' off')}>
                    <div className="ap-chips">
                      {SAT_TYPES.map(t => (
                        <button key={t} className={'ap-chip' + (satType===t ? ' on':'')} onClick={() => setSatType(t)}>{t}</button>
                      ))}
                    </div>
                    <Slider label="Amount" value={satAmt} min={0} max={100} unit="%" onChange={setSatAmt}/>
                  </div>

                  <div className="ap-section-h">Utility</div>
                  <Toggle checked={fxOn.deess} onChange={v => setFxOn({...fxOn, deess: v})} label="De-esser" sub="Tames harsh sibilance"/>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="ap-foot">
          <div className="ap-foot-l">
            <Icon name="clock" size={12}/>
            <span>Estimated render · <strong className="mono">{cost}s</strong></span>
            <span className="ap-foot-sep">·</span>
            <span>32-bit float · 48 kHz</span>
          </div>
          <div style={{flex:1}}/>
          <button className="btn btn-ghost btn-sm"><Icon name="arrow-down" size={12}/>Save preset</button>
          <button className="btn btn-outline btn-sm" onClick={() => setCompare(compare==='orig'?'proc':'orig')}>
            <Icon name="play" size={12}/>Preview A/B
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { onApply(version.id); onClose(); }}>
            <Icon name="waveform" size={12}/>Apply as new version
          </button>
        </div>
      </div>
    </div>
  );
}

window.AudioProcessing = AudioProcessing;
