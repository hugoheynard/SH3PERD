/* global React, Icon */
const { useState: useShellState } = React;

function Rail({ page, onNav }) {
  const items = [
    { id:'home', icon:'home', label:'Dashboard' },
    { id:'programs', icon:'timeline', label:'Timeline' },
    { id:'shows', icon:'show', label:'Shows' },
    { id:'music', icon:'music', label:'Music library' },
    { id:'contracts', icon:'contracts', label:'Contracts' },
    { id:'stats', icon:'stats', label:'Stats' },
    { id:'company', icon:'company', label:'Company' },
  ];
  return (
    <aside className="rail">
      <div className="rail-logo" title="SH3PHERD">S3</div>
      {items.map(it => (
        <button key={it.id} className={'rail-item' + (page===it.id ? ' active':'')} onClick={() => onNav(it.id)}>
          <Icon name={it.icon} size={18} />
          <span className="rail-tip">{it.label}</span>
        </button>
      ))}
      <div className="rail-spacer" />
      <button className="rail-item">
        <Icon name="help" size={17} />
        <span className="rail-tip">Help</span>
      </button>
      <button className="rail-item">
        <Icon name="settings" size={17} />
        <span className="rail-tip">Settings</span>
      </button>
      <div className="rail-avatar" title="Clément Aubry — Artistic Director">CA</div>
    </aside>
  );
}

function Header({ page, now }) {
  const pageMap = {
    home: { name: 'Dashboard', sub: 'Friday · May 24, 2026' },
    programs: { name: 'Programs · Parc des Artistes', sub: 'Live timeline — Sat 25' },
    shows: { name: 'Shows', sub: '12 active · 4 drafts' },
    music: { name: 'Music library', sub: '8 references · 17 versions' },
    contracts: { name: 'Contracts', sub: '€147,200 committed · 3 pending' },
    stats: { name: 'Stats', sub: 'Season 2026' },
    company: { name: 'Company', sub: 'Parc des Artistes' },
  }[page] || { name:'', sub:'' };

  return (
    <header className="header">
      <div className="header-crumbs">
        <div className="crumb-workspace">
          <div className="crumb-workspace-dot">PA</div>
          <span className="crumb-workspace-name">Parc des Artistes</span>
          <Icon name="chev-d" size={12} style={{color:'var(--text-muted)'}} />
        </div>
        <span className="crumb-sep">/</span>
        <span className="crumb-page">{pageMap.name}</span>
        <span className="crumb-sub">· {pageMap.sub}</span>
      </div>
      <div className="header-spacer" />
      <div className="search-bar">
        <Icon name="search" size={14} />
        <span style={{flex:1}}>Jump to artist, show, slot…</span>
        <kbd>⌘K</kbd>
      </div>
      <div className="header-actions">
        <button className="icon-btn" title="Help"><Icon name="help" size={17}/></button>
        <button className="icon-btn" title="Notifications"><Icon name="bell" size={17}/><span className="badge-dot"/></button>
        <div style={{width:1, height:24, background:'var(--border-light)', margin:'0 4px'}} />
        <div className="mono" style={{fontSize:12, color:'var(--text-secondary)', padding:'0 4px'}}>{now}</div>
      </div>
    </header>
  );
}

window.Rail = Rail;
window.Header = Header;
