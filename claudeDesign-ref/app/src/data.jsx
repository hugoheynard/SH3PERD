/* Shared mock data — festival scenario */

const COLOR_POOL = [
  'linear-gradient(135deg,#7c5bbf,#4a3b8f)',
  'linear-gradient(135deg,#06a4a4,#0a6e6e)',
  'linear-gradient(135deg,#c44230,#8a2e22)',
  'linear-gradient(135deg,#d4a017,#8a6a0c)',
  'linear-gradient(135deg,#1a9e6a,#116b47)',
  'linear-gradient(135deg,#e06450,#a44431)',
  'linear-gradient(135deg,#2dd4d4,#06a4a4)',
  'linear-gradient(135deg,#b794f4,#7c5bbf)',
];

const initials = (name) => name.split(/[\s-]+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');

// ── Music references (8, each with 1-3 versions)
const GENRES = ['Pop', 'Rock', 'EDM', 'Jazz/Soul', 'Hip-Hop', 'R&B', 'Classical', 'Folk/Acoustic'];

const REFS = [
  { id:'r1', title:'Nocturne en Fa',       artist:'Emma Rousseau',  cover:'linear-gradient(135deg,#7c5bbf,#4a3b8f)', versions:[
      { id:'v1a', label:'Studio',    dur:214, bpm:92,  genre:'Jazz/Soul', key:'Fm',  mst:4, nrg:3, eff:4, qlt:4, tracks:3, fav:true },
      { id:'v1b', label:'Acoustic',  dur:198, bpm:88,  genre:'Folk/Acoustic', key:'Fm', mst:3, nrg:2, eff:3, qlt:3, tracks:1 },
  ]},
  { id:'r2', title:'Midnight Glow',         artist:'Léo Vasquez',     cover:'linear-gradient(135deg,#06a4a4,#0a6e6e)', versions:[
      { id:'v2a', label:'Festival cut',  dur:248, bpm:124, genre:'EDM', key:'Am', mst:4, nrg:4, eff:3, qlt:4, tracks:4, fav:true },
      { id:'v2b', label:'Radio edit',    dur:190, bpm:124, genre:'Pop', key:'Am', mst:3, nrg:3, eff:3, qlt:3, tracks:2 },
      { id:'v2c', label:'Club remix',    dur:305, bpm:128, genre:'EDM', key:'Am', mst:4, nrg:4, eff:4, qlt:3, tracks:2 },
  ]},
  { id:'r3', title:'Paper Birds',           artist:'Iris Holloway',   cover:'linear-gradient(135deg,#c44230,#8a2e22)', versions:[
      { id:'v3a', label:'Album version', dur:263, bpm:102, genre:'Folk/Acoustic', key:'G', mst:3, nrg:2, eff:3, qlt:3, tracks:2 },
  ]},
  { id:'r4', title:'Bronze Lung',           artist:'Teo & The Heights', cover:'linear-gradient(135deg,#d4a017,#8a6a0c)', versions:[
      { id:'v4a', label:'Live @ Main',  dur:342, bpm:118, genre:'Rock', key:'D', mst:4, nrg:4, eff:4, qlt:4, tracks:3, fav:true },
      { id:'v4b', label:'Unplugged',    dur:298, bpm:104, genre:'Folk/Acoustic', key:'D', mst:3, nrg:2, eff:2, qlt:3, tracks:1 },
  ]},
  { id:'r5', title:'Kintsugi',              artist:'SAENA',           cover:'linear-gradient(135deg,#1a9e6a,#116b47)', versions:[
      { id:'v5a', label:'Orchestral',   dur:412, bpm:72,  genre:'Classical', key:'C#m', mst:4, nrg:2, eff:4, qlt:4, tracks:2 },
      { id:'v5b', label:'Solo piano',   dur:260, bpm:72,  genre:'Classical', key:'C#m', mst:3, nrg:1, eff:3, qlt:3, tracks:1 },
  ]},
  { id:'r6', title:'Neon Rivers',           artist:'Felix Aubert',    cover:'linear-gradient(135deg,#e06450,#a44431)', versions:[
      { id:'v6a', label:'Main',         dur:201, bpm:115, genre:'Pop', key:'Bm', mst:3, nrg:3, eff:3, qlt:3, tracks:1, fav:true },
  ]},
  { id:'r7', title:'Arôme brûlé',           artist:'Camille Noor',    cover:'linear-gradient(135deg,#2dd4d4,#06a4a4)', versions:[
      { id:'v7a', label:'EP version',   dur:234, bpm:94,  genre:'R&B', key:'E', mst:4, nrg:3, eff:3, qlt:4, tracks:2, fav:true },
      { id:'v7b', label:'Live Paris',   dur:276, bpm:96,  genre:'R&B', key:'E', mst:3, nrg:3, eff:4, qlt:3, tracks:1 },
      { id:'v7c', label:'Strings',      dur:290, bpm:90,  genre:'R&B', key:'E', mst:4, nrg:2, eff:4, qlt:4, tracks:1 },
  ]},
  { id:'r8', title:'Gravel & Gold',         artist:'Orson Finch',     cover:'linear-gradient(135deg,#b794f4,#7c5bbf)', versions:[
      { id:'v8a', label:'Single',       dur:185, bpm:108, genre:'Hip-Hop', key:'Gm', mst:3, nrg:4, eff:3, qlt:3, tracks:2 },
  ]},
];

// ── Festival: 3 days, 4 stages
const DAYS = [
  { id:'d1', label:'Fri 24', date:'May 24', sub:'Opening night' },
  { id:'d2', label:'Sat 25', date:'May 25', sub:'Main day'},
  { id:'d3', label:'Sun 26', date:'May 26', sub:'Closing' },
];

const STAGES = [
  { id:'s1', name:'Main Stage',     cap:'18,000', color:'#e06450', dotClass:'live' },
  { id:'s2', name:'Forest Stage',   cap:'6,200',  color:'#1a9e6a', dotClass:'' },
  { id:'s3', name:'Atelier Tent',   cap:'2,400',  color:'#7c5bbf', dotClass:'' },
  { id:'s4', name:'Late Lounge',    cap:'900',    color:'#d4a017', dotClass:'' },
];

// Slots on the Saturday ("d2") timeline — start in minutes from 12:00
// slot type: { id, stageId, start (minutes from 0:00), dur, artist, kind: 'headliner' | 'accent' | 'warn' | 'ok', set: 'SET' }
const SLOTS = [
  // Main Stage
  { id:'sl1', stageId:'s1', start:16*60,    dur:60,  artist:'Teo & The Heights', kind:'ok',        meta:'gates open' },
  { id:'sl2', stageId:'s1', start:17*60+30, dur:75,  artist:'Iris Holloway',     kind:'accent',    meta:'indie set' },
  { id:'sl3', stageId:'s1', start:19*60+15, dur:90,  artist:'Orson Finch',       kind:'accent',    meta:'hip-hop' },
  { id:'sl4', stageId:'s1', start:21*60+15, dur:110, artist:'Léo Vasquez',       kind:'headliner', meta:'HEADLINE' },
  // Forest Stage
  { id:'sl5', stageId:'s2', start:15*60+30, dur:50,  artist:'Emma Rousseau',     kind:'accent',    meta:'jazz trio' },
  { id:'sl6', stageId:'s2', start:17*60,    dur:60,  artist:'Camille Noor',      kind:'accent',    meta:'R&B' },
  { id:'sl7', stageId:'s2', start:18*60+30, dur:75,  artist:'Felix Aubert',      kind:'ok',        meta:'pop' },
  { id:'sl8', stageId:'s2', start:20*60+30, dur:90,  artist:'SAENA',             kind:'headliner', meta:'strings'},
  // Atelier Tent
  { id:'sl9',  stageId:'s3', start:14*60,   dur:45,  artist:'Camille Noor',      kind:'warn',      meta:'workshop — overlap!' },
  { id:'sl10', stageId:'s3', start:15*60+15,dur:60,  artist:'Emma Rousseau',     kind:'accent',    meta:'masterclass' },
  { id:'sl11', stageId:'s3', start:17*60,   dur:75,  artist:'Iris Holloway',     kind:'accent',    meta:'listening' },
  { id:'sl12', stageId:'s3', start:19*60,   dur:60,  artist:'Orson Finch',       kind:'ok',        meta:'Q&A'},
  // Late Lounge
  { id:'sl13', stageId:'s4', start:22*60,   dur:60,  artist:'Felix Aubert',      kind:'ok',        meta:'DJ'},
  { id:'sl14', stageId:'s4', start:23*60+15,dur:105, artist:'Léo Vasquez',       kind:'headliner', meta:'after — club remix' },
];

// Buffer regions (in projected minutes) — shown as striped bands on the grid
const BUFFERS = [
  { stageId:'s1', start:19*60,    dur:15, note:'Stage reset' },
];

// Artists roster
const ARTISTS = [
  { id:'a1', name:'Emma Rousseau',   role:'Piano · Jazz',     color:COLOR_POOL[0], scheduled:true },
  { id:'a2', name:'Léo Vasquez',     role:'EDM / Pop',        color:COLOR_POOL[1], scheduled:true },
  { id:'a3', name:'Iris Holloway',   role:'Indie',             color:COLOR_POOL[2], scheduled:true },
  { id:'a4', name:'Teo & Heights',   role:'Rock band',         color:COLOR_POOL[3], scheduled:true },
  { id:'a5', name:'SAENA',           role:'Classical',         color:COLOR_POOL[4], scheduled:true },
  { id:'a6', name:'Felix Aubert',    role:'Pop · DJ',          color:COLOR_POOL[5], scheduled:true },
  { id:'a7', name:'Camille Noor',    role:'R&B',               color:COLOR_POOL[6], scheduled:true },
  { id:'a8', name:'Orson Finch',     role:'Hip-Hop',           color:COLOR_POOL[7], scheduled:true },
  { id:'a9', name:'Nora Ayoub',      role:'Singer-songwriter', color:COLOR_POOL[0], scheduled:false },
  { id:'a10', name:'Vasco Mendes',   role:'Electro',           color:COLOR_POOL[1], scheduled:false },
  { id:'a11', name:'The Fenland',    role:'Folk',              color:COLOR_POOL[2], scheduled:false },
];

// Shows (staged sets)
const SHOWS = [
  { id:'sh1', title:'Festival opening — Main Stage', date:'24', month:'May', venue:'Parc des Artistes', duration:'02h 15m', items: 18, color:'linear-gradient(135deg,#06a4a4,#0a6e6e)', active:true },
  { id:'sh2', title:'Emma Rousseau — Jazz trio',     date:'24', month:'May', venue:'Forest Stage',      duration:'50 min',   items:  9, color:'linear-gradient(135deg,#7c5bbf,#4a3b8f)' },
  { id:'sh3', title:'Léo Vasquez HEADLINE',          date:'25', month:'May', venue:'Main Stage',        duration:'01h 50m',  items: 14, color:'linear-gradient(135deg,#c44230,#8a2e22)' },
  { id:'sh4', title:'SAENA — Strings',                date:'25', month:'May', venue:'Forest Stage',      duration:'01h 30m',  items: 11, color:'linear-gradient(135deg,#1a9e6a,#116b47)' },
  { id:'sh5', title:'Iris Holloway listening',       date:'25', month:'May', venue:'Atelier Tent',       duration:'01h 15m',  items: 10, color:'linear-gradient(135deg,#d4a017,#8a6a0c)' },
  { id:'sh6', title:'Sunday closing — Main Stage',   date:'26', month:'May', venue:'Main Stage',         duration:'02h 30m',  items: 16, color:'linear-gradient(135deg,#e06450,#a44431)' },
];

// Contracts
const CONTRACTS = [
  { id:'c1', artist:'Léo Vasquez',    role:'HEADLINE', fee:'€48,000', deposit:'€14,400 paid', status:'signed',  due:'—',            badge:'badge-success', stage:'Main Stage' },
  { id:'c2', artist:'SAENA',          role:'Headliner',fee:'€32,500', deposit:'€9,750 paid',  status:'signed',  due:'—',            badge:'badge-success', stage:'Forest Stage' },
  { id:'c3', artist:'Teo & Heights',  role:'Opening',   fee:'€18,200', deposit:'€5,460 pend.', status:'pending', due:'May 02',       badge:'badge-warn',    stage:'Main Stage' },
  { id:'c4', artist:'Orson Finch',    role:'Support',   fee:'€14,000', deposit:'€4,200 paid',  status:'signed',  due:'—',            badge:'badge-success', stage:'Main Stage' },
  { id:'c5', artist:'Iris Holloway',  role:'Support',   fee:'€11,800', deposit:'—',            status:'draft',   due:'May 04',       badge:'badge-muted',   stage:'Forest Stage' },
  { id:'c6', artist:'Camille Noor',   role:'Set',       fee:'€8,500',  deposit:'—',            status:'conflict',due:'overlap — fix',badge:'badge-alert',   stage:'Atelier Tent' },
  { id:'c7', artist:'Emma Rousseau',  role:'Set',       fee:'€6,400',  deposit:'€1,920 paid',  status:'signed',  due:'—',            badge:'badge-success', stage:'Forest Stage' },
  { id:'c8', artist:'Felix Aubert',   role:'DJ',        fee:'€5,200',  deposit:'—',            status:'signed',  due:'—',            badge:'badge-success', stage:'Late Lounge' },
  { id:'c9', artist:'Nora Ayoub',     role:'Warm-up',   fee:'€3,800',  deposit:'—',            status:'offer',   due:'Apr 29',       badge:'badge-info',    stage:'Atelier Tent' },
];

window.MOCK = { REFS, GENRES, DAYS, STAGES, SLOTS, BUFFERS, ARTISTS, SHOWS, CONTRACTS, initials, COLOR_POOL };
