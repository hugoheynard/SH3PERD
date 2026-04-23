/* global React, ReactDOM, Rail, Header, PageMusic, PageHome, PageProgramsLive, PageShows, PageContracts, PageStats, TweaksPanel */
const { useState, useEffect } = React;

function App() {
  const [page, setPage] = useState(() => localStorage.getItem('sh3_page') || 'music');
  const [clock, setClock] = useState('17:47:22');
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [theme, setTheme] = useState(window.__TWEAKS.theme || 'dark');

  useEffect(() => { localStorage.setItem('sh3_page', page); }, [page]);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.__TWEAKS.theme = theme;
  }, [theme]);

  // Simulated clock that drifts forward for "live" feeling
  useEffect(() => {
    let base = new Date();
    base.setHours(17, 47, 22, 0);
    const tick = () => {
      base = new Date(base.getTime() + 1000);
      const h = String(base.getHours()).padStart(2,'0');
      const m = String(base.getMinutes()).padStart(2,'0');
      const s = String(base.getSeconds()).padStart(2,'0');
      setClock(`${h}:${m}:${s}`);
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Tweaks bridge with host
  useEffect(() => {
    const handler = (e) => {
      const d = e.data || {};
      if (d.type === '__activate_edit_mode') setTweaksOpen(true);
      else if (d.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const onTheme = (t) => {
    setTheme(t);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { theme: t } }, '*');
  };

  const Pages = {
    home: <PageHome clock={clock}/>,
    programs: <PageProgramsLive now={clock.slice(0,5)}/>,
    shows: <PageShows/>,
    music: <PageMusic/>,
    contracts: <PageContracts/>,
    stats: <PageStats/>,
    company: <PageStats/>,
  };

  return (
    <div className="app">
      <Rail page={page} onNav={setPage}/>
      <Header page={page} now={clock}/>
      <main className="page" data-screen-label={page}>
        {Pages[page] || <PageMusic/>}
      </main>
      <TweaksPanel open={tweaksOpen} theme={theme} onTheme={onTheme} onClose={() => setTweaksOpen(false)}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
