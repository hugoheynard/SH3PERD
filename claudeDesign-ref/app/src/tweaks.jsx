/* global React */
function TweaksPanel({ open, theme, onTheme, onClose }) {
  if (!open) return null;
  return (
    <div className="tweaks-panel open">
      <div className="tweaks-panel-h">
        <span>Tweaks</span>
        <button className="icon-btn" onClick={onClose} style={{width:20, height:20}}>×</button>
      </div>
      <div className="tweaks-row">
        <span className="tweaks-lab">Theme</span>
        <span className="tweaks-segmented">
          <button className={theme==='dark'?'on':''} onClick={() => onTheme('dark')}>Dark</button>
          <button className={theme==='light'?'on':''} onClick={() => onTheme('light')}>Light</button>
        </span>
      </div>
    </div>
  );
}
window.TweaksPanel = TweaksPanel;
