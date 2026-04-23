/* global React, Icon, MOCK */
const { useState: useP, useRef: usePR, useEffect: usePE } = React;

function PageProgramsLive({ now }) {
  const { DAYS, STAGES, SLOTS, BUFFERS, ARTISTS } = window.MOCK;
  const [day, setDay] = useP('d2');
  const [zoom, setZoom] = useP('1h'); // '30m' | '1h' | '2h'
  const [selected, setSelected] = useP('sl4');

  // Timeline: 14:00 → 02:00 next day (12 hours)
  const START_H = 14;
  const HOURS = 12;
  const PX_PER_HOUR = zoom === '30m' ? 240 : zoom === '1h' ? 140 : 90;
  const totalWidth = HOURS * PX_PER_HOUR;

  // Now-line: currently 17:47 mapped to 14:00..02:00 range
  const nowMinutes = 17*60 + 47;
  const nowLeftPx = ((nowMinutes - START_H*60) / 60) * PX_PER_HOUR;

  return (
    <div className="prg-root" style={{'--px-per-hour': PX_PER_HOUR + 'px'}}>
      <div className="prg-header">
        <div className="prg-title-block">
          <div className="prg-event-n">Parc des Artistes — Festival 2026 <span className="badge badge-alert">● LIVE</span></div>
          <div className="prg-event-m">4 stages · 14 sets · Day 2/3 · curator: Clément Aubry</div>
        </div>
        <div className="prg-day-tabs">
          {DAYS.map(d => (
            <button key={d.id} className={'prg-day-tab' + (day===d.id ? ' active':'')} onClick={() => setDay(d.id)}>
              {d.label}
            </button>
          ))}
        </div>
        <div style={{flex:1}}/>
        <div className="prg-zoom">
          {['30m','1h','2h'].map(z => (
            <button key={z} className={zoom===z ? 'on':''} onClick={() => setZoom(z)}>{z}</button>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm"><Icon name="plus" size={12}/>Insert slot</button>
        <button className="btn btn-primary btn-sm"><Icon name="play" size={11}/>Publish</button>
        <div className="prg-now">
          <div className="prg-now-time mono">{now}</div>
          <div className="prg-now-sub">● live · now-line active</div>
        </div>
      </div>

      <div className="prg-body">
        <aside className="prg-side">
          <div className="prg-side-h">
            <span className="prg-side-h-t">Artists</span>
            <span style={{fontSize:10, color:'var(--text-muted)'}}>{ARTISTS.length}</span>
          </div>
          <div className="prg-side-search">
            <Icon name="search" size={12}/>
            <span>Search…</span>
          </div>
          <div className="artist-chips scroll">
            {ARTISTS.map(a => (
              <div key={a.id} className={'artist-chip' + (a.scheduled?' scheduled':'')} title={a.scheduled ? 'Already scheduled — drag to add another set':'Drag to timeline'}>
                <span className="artist-chip-av" style={{background:a.color}}>{MOCK.initials(a.name)}</span>
                <div className="artist-chip-body">
                  <div className="artist-chip-n">{a.name}</div>
                  <div className="artist-chip-m">{a.role}</div>
                </div>
                {a.scheduled
                  ? <Icon name="drag" size={12} style={{color:'var(--text-faded)'}}/>
                  : <span className="artist-chip-dot"/>}
              </div>
            ))}
          </div>
        </aside>

        <div className="prg-canvas scroll" style={{overflowX:'auto'}}>
          <div style={{minWidth: 120 + totalWidth}}>
            <div className="prg-ruler" style={{width: 120 + totalWidth}}>
              <span className="prg-ruler-label">STAGES</span>
              {Array.from({length:HOURS}).map((_, i) => {
                const h = (START_H + i) % 24;
                return (
                  <div key={i} className="prg-ruler-slot" style={{width: PX_PER_HOUR}}>
                    <span className="prg-ruler-hour">{String(h).padStart(2,'0')}:00</span>
                  </div>
                );
              })}
            </div>

            <div className="prg-stage-rows">
              {STAGES.map(st => {
                const slots = SLOTS.filter(s => s.stageId === st.id);
                const buffers = BUFFERS.filter(b => b.stageId === st.id);
                return (
                  <div key={st.id} className="prg-stage-row">
                    <div className="prg-stage-head">
                      <div className="prg-stage-head-n">
                        <span className="prg-stage-head-bullet" style={{background: st.color}}/>
                        {st.name}
                      </div>
                      <div className="prg-stage-head-m">Stage</div>
                      <div className="prg-stage-head-cap"><Icon name="user" size={10}/>{st.cap}</div>
                    </div>
                    <div className="prg-stage-lanes" style={{width: totalWidth}}>
                      {buffers.map((b, i) => {
                        const left = ((b.start - START_H*60) / 60) * PX_PER_HOUR;
                        const w = (b.dur / 60) * PX_PER_HOUR;
                        return <div key={i} className="prg-buffer" style={{left, width: w}}>+{b.dur}m</div>;
                      })}
                      {slots.map(sl => {
                        const left = ((sl.start - START_H*60) / 60) * PX_PER_HOUR;
                        const w = (sl.dur / 60) * PX_PER_HOUR;
                        const artist = ARTISTS.find(a => a.name === sl.artist);
                        const timeStart = `${String(Math.floor(sl.start/60)%24).padStart(2,'0')}:${String(sl.start%60).padStart(2,'0')}`;
                        const endM = sl.start + sl.dur;
                        const timeEnd = `${String(Math.floor(endM/60)%24).padStart(2,'0')}:${String(endM%60).padStart(2,'0')}`;
                        return (
                          <div key={sl.id}
                               className={'prg-slot ' + sl.kind + (selected===sl.id?' sel':'')}
                               style={{left, width: w}}
                               onClick={() => setSelected(sl.id)}>
                            <div className="prg-slot-top">
                              {artist && <span className="prg-slot-av" style={{background: artist.color}}>{MOCK.initials(sl.artist)}</span>}
                              <span className="prg-slot-n">{sl.artist}</span>
                            </div>
                            <div className="prg-slot-bot">
                              <span>{timeStart} – {timeEnd} · {sl.dur}m</span>
                              <span className="prg-slot-meta-ico">{sl.meta}</span>
                            </div>
                          </div>
                        );
                      })}
                      {/* Now-line inside lanes (positioned relative to lanes width) */}
                      <div className="prg-now-line" style={{left: nowLeftPx}}>
                        <span className="prg-now-label mono">NOW {now}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="prg-workload">
        <span className="prg-workload-t">Artist workload</span>
        <div className="prg-workload-chips scroll">
          {[
            ['Léo Vasquez',  '2 sets · 3h 35m', 'warn'],
            ['Camille Noor', '2 sets · 1h 45m', ''],
            ['Emma Rousseau','2 sets · 1h 50m', ''],
            ['SAENA',        '1 set · 1h 30m',  ''],
            ['Iris Holloway','2 sets · 2h 30m', ''],
            ['Teo & Heights','1 set · 1h 00m',  ''],
            ['Orson Finch',  '2 sets · 2h 30m', ''],
            ['Felix Aubert', '2 sets · 2h 15m', ''],
          ].map(([n,b,cls], i) => (
            <span key={i} className={'wl-chip ' + cls}>
              <span className="wl-chip-av" style={{background:MOCK.COLOR_POOL[i%MOCK.COLOR_POOL.length]}}>{MOCK.initials(n)}</span>
              <span className="wl-chip-n">{n}</span>
              <span className="wl-chip-b mono">{b}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
window.PageProgramsLive = PageProgramsLive;
