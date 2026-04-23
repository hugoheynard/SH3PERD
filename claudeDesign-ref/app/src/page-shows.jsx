/* global React, Icon, MOCK */
const { useState: useSh } = React;

function PageShows() {
  const { SHOWS } = window.MOCK;
  const [activeId, setActiveId] = useSh('sh1');
  const active = SHOWS.find(s => s.id === activeId) || SHOWS[0];

  const sections = [
    { n:1, t:'Overture', dur:'18:30', items:[
      { n:'1.1', t:'Nocturne en Fa',   a:'Emma Rousseau', bpm:92,  dur:'3:34' },
      { n:'1.2', t:'Paper Birds',      a:'Iris Holloway', bpm:102, dur:'4:23' },
      { n:'1.3', t:'Kintsugi (solo)',  a:'SAENA',         bpm:72,  dur:'4:20' },
    ]},
    { n:2, t:'Second act — building', dur:'42:10', items:[
      { n:'2.1', t:'Midnight Glow',    a:'Léo Vasquez',   bpm:124, dur:'3:10' },
      { n:'2.2', t:'Arôme brûlé',      a:'Camille Noor',  bpm:94,  dur:'3:54' },
      { n:'2.3', t:'Neon Rivers',      a:'Felix Aubert',  bpm:115, dur:'3:21' },
      { n:'2.4', t:'Bronze Lung',      a:'Teo & Heights', bpm:118, dur:'5:42' },
    ]},
    { n:3, t:'Finale — headline block', dur:'31:20', items:[
      { n:'3.1', t:'Midnight Glow — Club remix', a:'Léo Vasquez',   bpm:128, dur:'5:05' },
      { n:'3.2', t:'Gravel & Gold',             a:'Orson Finch',   bpm:108, dur:'3:05' },
      { n:'3.3', t:'Kintsugi — Orchestral',     a:'SAENA',         bpm:72,  dur:'6:52' },
    ]},
  ];

  return (
    <div className="shows-root">
      <aside className="shows-list scroll">
        <div className="shows-list-h">
          <span className="shows-list-h-t">Shows · 6</span>
          <button className="icon-btn"><Icon name="plus" size={14}/></button>
        </div>
        {SHOWS.map(s => (
          <div key={s.id} className={'show-row' + (s.id===activeId?' active':'')} onClick={() => setActiveId(s.id)}>
            <div className="show-row-date">
              <div className="show-row-date-n">{s.date}</div>
              <div className="show-row-date-m">{s.month}</div>
            </div>
            <div className="show-row-body">
              <div className="show-row-t">{s.title}</div>
              <div className="show-row-m"><span>{s.venue}</span><span>{s.duration}</span><span>{s.items} items</span></div>
            </div>
          </div>
        ))}
      </aside>
      <div className="show-detail">
        <div className="show-detail-h">
          <div className="show-detail-art" style={{background:active.color}}>{active.date}</div>
          <div className="show-detail-t-block">
            <div className="show-detail-t">{active.title}</div>
            <div className="show-detail-m"><span>{active.venue}</span>·<span>{active.month} {active.date}, 2026</span>·<span className="mono">{active.duration}</span>·<span>{active.items} items</span></div>
          </div>
          <button className="btn btn-ghost btn-sm"><Icon name="edit" size={12}/>Edit</button>
          <button className="btn btn-primary btn-sm"><Icon name="play" size={11}/>Rehearse</button>
        </div>
        <div className="show-sections scroll">
          {sections.map(s => (
            <div key={s.n} className="show-section">
              <div className="show-section-h">
                <span className="show-section-num">{s.n}</span>
                <span className="show-section-t">{s.t}</span>
                <span className="show-section-m">{s.dur}</span>
              </div>
              <div className="show-section-body">
                {s.items.map(it => (
                  <div key={it.n} className="show-item">
                    <span className="show-item-n">{it.n}</span>
                    <span className="show-item-t">{it.t}</span>
                    <span className="show-item-bpm mono">{it.bpm} bpm</span>
                    <span className="show-item-dur mono">{it.dur}</span>
                    <span className="show-item-a">{it.a}</span>
                    <span><Icon name="more" size={13} style={{color:'var(--text-muted)'}}/></span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
window.PageShows = PageShows;
