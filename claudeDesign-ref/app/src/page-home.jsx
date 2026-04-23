/* global React, Icon, MOCK */
const { useState: useH, useEffect: useHE } = React;

function PageHome({ clock }) {
  const { SHOWS, SLOTS, STAGES } = window.MOCK;
  const next = SHOWS[0];
  const slotsToday = SLOTS.slice(0, 6);

  return (
    <div className="home-root scroll">
      <div className="home-hero">
        <div className="hero-card">
          <div className="hero-greet">Bonsoir Clément · T-minus 18h to doors</div>
          <div className="hero-date">Parc des Artistes — Day 2</div>
          <div className="hero-sub">4 stages · 14 sets · 18,000 capacity at Main · clear, 18°C</div>
          <div className="hero-next">
            <div className="hero-next-time mono">17:30</div>
            <div className="hero-next-info">
              <div className="hero-next-info-t">Next soundcheck</div>
              <div className="hero-next-info-v">Léo Vasquez — Main Stage</div>
              <div className="hero-countdown">starts in 32 min · crew not confirmed</div>
            </div>
            <button className="btn btn-outline btn-sm">Open in timeline</button>
          </div>
        </div>
        <div className="hero-status">
          <div className="status-tile">
            <div className="status-tile-t"><span style={{width:6,height:6,borderRadius:'50%',background:'var(--color-success)'}}/>On schedule</div>
            <div className="status-tile-v">12<span style={{fontSize:12,color:'var(--text-muted)',fontWeight:400}}>/14</span></div>
            <div className="status-tile-x">sets confirmed · 2 on watch</div>
          </div>
          <div className="status-tile">
            <div className="status-tile-t"><span style={{width:6,height:6,borderRadius:'50%',background:'var(--color-warning)'}}/>Attention</div>
            <div className="status-tile-v">3</div>
            <div className="status-tile-x">conflicts · overlap Atelier 14:00</div>
          </div>
          <div className="status-tile">
            <div className="status-tile-t"><span style={{width:6,height:6,borderRadius:'50%',background:'var(--accent-color)'}}/>Contracts</div>
            <div className="status-tile-v">€147,2k</div>
            <div className="status-tile-x">committed · 3 pending signatures</div>
          </div>
          <div className="status-tile">
            <div className="status-tile-t"><Icon name="clock" size={11}/>Live clock</div>
            <div className="status-tile-v mono">{clock}</div>
            <div className="status-tile-x" style={{color:'var(--color-alert-light)'}}>now-line sweeping · Day 2 17:00</div>
          </div>
        </div>
      </div>

      <div className="home-grid">
        <div className="widget span-2">
          <div className="widget-h">
            <div className="widget-t"><Icon name="timeline" size={12}/>Today's timeline</div>
            <span className="widget-sub">4 stages · live</span>
          </div>
          <div className="mini-tl">
            {STAGES.map((s,i) => {
              const stageSlots = slotsToday.filter(sl => sl.stageId === s.id);
              return (
                <div key={s.id} className="mini-tl-row">
                  <span className="mini-tl-lab" style={{color: s.color}}>{s.name.split(' ')[0]}</span>
                  <span className="mini-tl-bar">
                    {stageSlots.map(sl => {
                      const left = ((sl.start - 14*60) / (10*60)) * 100;
                      const w = (sl.dur / (10*60)) * 100;
                      const cls = sl.kind === 'headliner' ? 'info' : sl.kind === 'warn' ? 'warn' : '';
                      return <span key={sl.id} className={'mini-tl-slot ' + cls} style={{left:left+'%', width:w+'%'}}/>;
                    })}
                    <span className="mini-tl-now" style={{left:'30%'}}/>
                  </span>
                </div>
              );
            })}
            <div style={{display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text-muted)', padding:'4px 0 0 68px'}}>
              <span className="mono">14:00</span><span className="mono">16:00</span><span className="mono">18:00</span><span className="mono">20:00</span><span className="mono">22:00</span><span className="mono">00:00</span>
            </div>
          </div>
        </div>

        <div className="widget">
          <div className="widget-h"><div className="widget-t">Genre mix</div><span className="widget-sub">season</span></div>
          <div className="donut-ring">
            <svg width="120" height="120" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="15.9" fill="none" stroke="var(--surface-raised)" strokeWidth="5"/>
              <circle cx="20" cy="20" r="15.9" fill="none" stroke="#7c5bbf" strokeWidth="5" strokeDasharray="28 100" strokeDashoffset="25" transform="rotate(-90 20 20)"/>
              <circle cx="20" cy="20" r="15.9" fill="none" stroke="#06a4a4" strokeWidth="5" strokeDasharray="22 100" strokeDashoffset="-3" transform="rotate(-90 20 20)"/>
              <circle cx="20" cy="20" r="15.9" fill="none" stroke="#e06450" strokeWidth="5" strokeDasharray="18 100" strokeDashoffset="-25" transform="rotate(-90 20 20)"/>
              <circle cx="20" cy="20" r="15.9" fill="none" stroke="#d4a017" strokeWidth="5" strokeDasharray="14 100" strokeDashoffset="-43" transform="rotate(-90 20 20)"/>
              <circle cx="20" cy="20" r="15.9" fill="none" stroke="#1a9e6a" strokeWidth="5" strokeDasharray="18 100" strokeDashoffset="-57" transform="rotate(-90 20 20)"/>
            </svg>
            <div className="donut-center">
              <div>
                <div className="donut-center-n">128</div>
                <div className="donut-center-l">refs</div>
              </div>
            </div>
          </div>
          <div className="donut-legend">
            {[['Pop','#7c5bbf',28],['Jazz/Soul','#06a4a4',22],['EDM','#e06450',18],['Rock','#d4a017',14],['Classical','#1a9e6a',18]].map(([g,c,n])=>(
              <div key={g} className="donut-legend-row"><span className="donut-legend-sw" style={{background:c}}/>{g}<span className="donut-legend-n mono">{n}</span></div>
            ))}
          </div>
        </div>

        <div className="widget">
          <div className="widget-h"><div className="widget-t">Upcoming</div><span className="widget-sub">next 7 days</span></div>
          <div className="mini-cal">
            {[{d:'24',m:'May',t:'Festival opening',s:'4 stages · 14 sets'},
              {d:'25',m:'May',t:'Main day — HEADLINE',s:'Léo Vasquez · 1h50'},
              {d:'26',m:'May',t:'Closing — Sunset strings',s:'SAENA · Main'},
              {d:'31',m:'May',t:'Post-mortem',s:'Team · 10:00'}].map((x,i)=>(
              <div key={i} className="mini-cal-row">
                <div className="mini-cal-date">
                  <div className="mini-cal-date-n">{x.d}</div>
                  <div className="mini-cal-date-m">{x.m}</div>
                </div>
                <div className="mini-cal-body">
                  <div className="mini-cal-title">{x.t}</div>
                  <div className="mini-cal-meta"><span>{x.s}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="widget span-2">
          <div className="widget-h"><div className="widget-t">Activity</div><span className="widget-sub">last hour</span></div>
          <div className="feed">
            {[
              {av:'LV', c:'linear-gradient(135deg,#06a4a4,#0a6e6e)', t:<><strong>Léo Vasquez</strong> confirmed rider — catering + 2 techs</>, time:'just now'},
              {av:'IH', c:'linear-gradient(135deg,#c44230,#8a2e22)', t:<><strong>Iris Holloway</strong> moved to 17:30 on Main Stage</>, time:'6 min ago'},
              {av:'SA', c:'linear-gradient(135deg,#1a9e6a,#116b47)', t:<><strong>SAENA</strong> master for “Kintsugi — Orchestral” uploaded</>, time:'22 min ago'},
              {av:'CN', c:'linear-gradient(135deg,#2dd4d4,#06a4a4)', t:<><span style={{color:'var(--color-alert-light)'}}>Conflict:</span> Camille Noor overlaps workshop 14:00 → 14:45</>, time:'1h'},
            ].map((r,i)=>(
              <div key={i} className="feed-row">
                <div className="feed-av" style={{background:r.c}}>{r.av}</div>
                <div className="feed-body">
                  <div className="feed-txt">{r.t}</div>
                  <div className="feed-time">{r.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="widget">
          <div className="widget-h"><div className="widget-t">To master</div><span className="widget-sub">8 tracks</span></div>
          <div className="feed">
            {[['Nocturne en Fa','Acoustic', 2], ['Paper Birds','Album', 3], ['Bronze Lung','Unplugged', 2], ['Neon Rivers','Main', 1]].map((t,i)=>(
              <div key={i} className="feed-row">
                <span style={{width:28, height:28, borderRadius:6, display:'grid', placeItems:'center', background:'var(--surface-raised)', color:'var(--accent-color-light)'}}><Icon name="waveform" size={13}/></span>
                <div className="feed-body">
                  <div className="feed-txt">{t[0]} <span>— {t[1]}</span></div>
                  <div className="feed-time">{t[2]} track{t[2]>1?'s':''} pending</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
window.PageHome = PageHome;
