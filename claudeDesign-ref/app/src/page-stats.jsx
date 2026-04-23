/* global React, Icon */
function PageStats() {
  // Simple SVG sparkline / bar chart
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const revenue = [22,24,31,28,42,58,81,72,54,38,30,26];
  const rehearsals = [18,22,26,30,38,52,66,62,48,36,28,22];
  const max = 90;

  return (
    <div className="stats-root scroll">
      <div className="stats-kpi-row">
        <div className="stats-kpi">
          <div className="stats-kpi-l">Season revenue</div>
          <div className="stats-kpi-v mono">€412.8k</div>
          <div className="stats-kpi-d up"><Icon name="arrow-up" size={10}/>+18.4% vs 2025</div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-l">Tickets sold</div>
          <div className="stats-kpi-v mono">47,920</div>
          <div className="stats-kpi-d up"><Icon name="arrow-up" size={10}/>+6.2%</div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-l">Artists booked</div>
          <div className="stats-kpi-v mono">68</div>
          <div className="stats-kpi-d up"><Icon name="arrow-up" size={10}/>+12</div>
        </div>
        <div className="stats-kpi">
          <div className="stats-kpi-l">Avg fee / set</div>
          <div className="stats-kpi-v mono">€8,420</div>
          <div className="stats-kpi-d down"><Icon name="arrow-down" size={10}/>−2.1%</div>
        </div>
      </div>

      <div className="stats-charts">
        <div className="stats-chart">
          <div className="stats-chart-h">
            <div className="stats-chart-t">Revenue & rehearsals · 2026</div>
            <div style={{display:'flex', gap:12, fontSize:11}}>
              <span style={{display:'flex', alignItems:'center', gap:6, color:'var(--text-secondary)'}}><span style={{width:10,height:10,borderRadius:2,background:'var(--accent-color)'}}/>Revenue (k€)</span>
              <span style={{display:'flex', alignItems:'center', gap:6, color:'var(--text-secondary)'}}><span style={{width:10,height:10,borderRadius:2,background:'var(--color-info)'}}/>Rehearsals</span>
            </div>
          </div>
          <svg className="chart-svg" viewBox="0 0 720 200" preserveAspectRatio="none">
            {[0,1,2,3,4].map(i => (
              <line key={i} x1="30" x2="710" y1={20+i*40} y2={20+i*40} stroke="var(--divider-color)" strokeWidth="1"/>
            ))}
            {months.map((m,i) => (
              <text key={i} x={40+i*56} y={194} fill="var(--text-muted)" fontSize="10" fontFamily="JetBrains Mono">{m}</text>
            ))}
            {/* Revenue bars */}
            {revenue.map((v,i) => {
              const h = (v/max)*160;
              return <rect key={i} x={36+i*56} y={180-h} width="16" height={h} fill="var(--accent-color)" opacity="0.85" rx="2"/>;
            })}
            {/* Rehearsals line */}
            <polyline fill="none" stroke="var(--color-info)" strokeWidth="2" points={rehearsals.map((v,i)=>`${52+i*56},${180-(v/max)*160}`).join(' ')}/>
            {rehearsals.map((v,i) => (
              <circle key={i} cx={52+i*56} cy={180-(v/max)*160} r="3" fill="var(--color-info)"/>
            ))}
          </svg>
        </div>

        <div className="stats-chart">
          <div className="stats-chart-h">
            <div className="stats-chart-t">Genre mix · top 5</div>
            <span style={{fontSize:11, color:'var(--text-muted)'}}>128 references</span>
          </div>
          {[['Pop', 28, '#7c5bbf'], ['Jazz/Soul', 22, '#06a4a4'], ['EDM', 18, '#e06450'], ['Classical', 18, '#1a9e6a'], ['Rock', 14, '#d4a017']].map(([g,n,c]) => (
            <div key={g} style={{marginBottom:14}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:5}}>
                <span style={{color:'var(--text-secondary)'}}>{g}</span>
                <span className="mono" style={{color:'var(--text-primary)'}}>{n}</span>
              </div>
              <div style={{height:8, background:'var(--surface-raised)', borderRadius:4, overflow:'hidden'}}>
                <div style={{height:'100%', width: (n/30*100)+'%', background:c, borderRadius:4}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-charts" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
        {[
          {t:'Top artists', rows:[['Léo Vasquez','€48.2k'],['SAENA','€32.5k'],['Teo & Heights','€18.2k'],['Orson Finch','€14.0k'],['Iris Holloway','€11.8k']]},
          {t:'Stages performance', rows:[['Main Stage','18,000 / 18,000'],['Forest Stage','5,840 / 6,200'],['Atelier Tent','2,210 / 2,400'],['Late Lounge','860 / 900']]},
          {t:'On-time rate', rows:[['Saturday','96%'],['Friday','92%'],['Sunday','88%'],['Workshop','74%']]},
        ].map((c,i) => (
          <div key={i} className="stats-chart">
            <div className="stats-chart-h"><div className="stats-chart-t">{c.t}</div></div>
            {c.rows.map((r,j) => (
              <div key={j} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--divider-color)', fontSize:12}}>
                <span style={{color:'var(--text-primary)'}}>{r[0]}</span>
                <span className="mono" style={{color:'var(--text-secondary)'}}>{r[1]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
window.PageStats = PageStats;
