/* global React, Icon, MOCK */
function PageContracts() {
  const { CONTRACTS, COLOR_POOL, initials } = window.MOCK;
  const filters = ['All', 'Signed', 'Pending', 'Draft', 'Conflict', 'Offer'];
  return (
    <div className="contracts-root scroll">
      <div className="contracts-toolbar">
        {filters.map((f,i) => (
          <span key={f} className={'filter-chip' + (i===0?' on':'')}>{f} <span style={{color:'var(--text-muted)'}}>{[9,5,1,1,1,1][i]}</span></span>
        ))}
        <div style={{flex:1}}/>
        <button className="btn btn-ghost btn-sm"><Icon name="filter" size={12}/>More filters</button>
        <button className="btn btn-primary btn-sm"><Icon name="plus" size={12}/>New contract</button>
      </div>
      <div className="contract-grid">
        {CONTRACTS.map((c,i) => (
          <div key={c.id} className="contract-card">
            <div className="contract-card-h">
              <div style={{display:'flex', gap:10, alignItems:'center', minWidth:0}}>
                <span style={{width:36, height:36, borderRadius:8, display:'grid', placeItems:'center', background: COLOR_POOL[i%COLOR_POOL.length], color:'#fff', fontWeight:700, fontSize:12, flexShrink:0}}>{initials(c.artist)}</span>
                <div style={{minWidth:0}}>
                  <div className="contract-card-t">{c.artist}</div>
                  <div className="contract-card-sub">{c.role} · {c.stage}</div>
                </div>
              </div>
              <span className={'badge ' + c.badge}>{c.status}</span>
            </div>
            <div className="contract-card-body">
              <div>
                <div className="contract-card-field-l">Fee</div>
                <div className="contract-card-field-v mono">{c.fee}</div>
              </div>
              <div>
                <div className="contract-card-field-l">Deposit</div>
                <div className="contract-card-field-v mono" style={{fontSize:12}}>{c.deposit}</div>
              </div>
              <div>
                <div className="contract-card-field-l">Due</div>
                <div className="contract-card-field-v mono" style={{fontSize:13}}>{c.due}</div>
              </div>
              <div>
                <div className="contract-card-field-l">Rider</div>
                <div className="contract-card-field-v" style={{fontSize:12, color: c.status==='signed' ? 'var(--color-success)' : 'var(--text-secondary)'}}>{c.status==='signed'?'Received':'—'}</div>
              </div>
            </div>
            <div className="contract-card-foot">
              <span className="mono" style={{fontSize:11, color:'var(--text-muted)'}}>#{c.id.toUpperCase()} · v2.1</span>
              <div style={{display:'flex', gap:4}}>
                <button className="icon-btn" title="Open"><Icon name="edit" size={13}/></button>
                <button className="icon-btn" title="More"><Icon name="more" size={13}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
window.PageContracts = PageContracts;
