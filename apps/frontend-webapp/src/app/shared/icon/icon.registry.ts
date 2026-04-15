/**
 * Icon registry — central catalogue of every SVG available to `sh3-icon`.
 *
 * Each icon lives as a real file in `src/assets/icons/<category>/<name>.svg`
 * and is imported here as text. Angular's esbuild builder is configured to
 * treat `.svg` files as text loaders (see `angular.json > loader`), so
 * `import foo from './foo.svg'` returns the raw markup as a string at
 * build time.
 *
 * Adding an icon
 * --------------
 * 1. Drop the `.svg` file in the matching category folder (or create one).
 *    Prefer single-colour SVGs using `currentColor` on `fill` / `stroke`
 *    so the icon inherits `color:` from the host element.
 * 2. Import it below and add it to `SH3_ICONS`.
 * 3. The union type `Sh3IconName` is derived automatically.
 *
 * Taxonomy (evolves, rename/move freely — callers are checked by the compiler)
 * - actions/    user-initiated verbs (upload, download, edit, bin, search, …)
 * - navigation/ arrows, chevrons, breadcrumb helpers
 * - menu/       top-level app destinations (home, company, contracts, …)
 * - music/      domain-specific: notes, metronome, play, etc.
 * - status/     feedback badges: clock, completed, diamond, lightning, award
 * - user/       people + role indicators: king, leader, team, …
 */

// ── actions ────────────────────────────────────────────────────────
import upload from '../../../assets/icons/actions/upload.svg';
import download from '../../../assets/icons/actions/download.svg';
import edit from '../../../assets/icons/actions/edit.svg';
import addDoc from '../../../assets/icons/actions/add-doc.svg';
import search from '../../../assets/icons/actions/search.svg';
import reset from '../../../assets/icons/actions/reset.svg';
import view from '../../../assets/icons/actions/view.svg';
import bin from '../../../assets/icons/actions/bin.svg';
import logout from '../../../assets/icons/actions/logout.svg';
import playlistAdd from '../../../assets/icons/actions/playlist-add.svg';

// ── navigation ─────────────────────────────────────────────────────
import caretUp from '../../../assets/icons/navigation/caret-up.svg';
import caretDown from '../../../assets/icons/navigation/caret-down.svg';
import folder from '../../../assets/icons/navigation/folder.svg';
import menu from '../../../assets/icons/navigation/menu.svg';

// ── menu ───────────────────────────────────────────────────────────
import home from '../../../assets/icons/menu/home.svg';
import program from '../../../assets/icons/menu/program.svg';
import company from '../../../assets/icons/menu/company.svg';
import contracts from '../../../assets/icons/menu/contracts.svg';
import settings from '../../../assets/icons/menu/settings.svg';
import stats from '../../../assets/icons/menu/stats.svg';
import music from '../../../assets/icons/menu/music.svg';

// ── music ──────────────────────────────────────────────────────────
import metronome from '../../../assets/icons/music/metronome.svg';
import musicFile from '../../../assets/icons/music/music-file.svg';
import play from '../../../assets/icons/music/play.svg';
import playCircle from '../../../assets/icons/music/play-circle.svg';
import fire from '../../../assets/icons/music/fire.svg';
import heart from '../../../assets/icons/music/heart.svg';
import heartBorder from '../../../assets/icons/music/heart-border.svg';

// ── status ─────────────────────────────────────────────────────────
import completed from '../../../assets/icons/status/completed.svg';
import clock from '../../../assets/icons/status/clock.svg';
import diamond from '../../../assets/icons/status/diamond.svg';
import award from '../../../assets/icons/status/award.svg';
import lightning from '../../../assets/icons/status/lightning.svg';
import offlineBolt from '../../../assets/icons/status/offline-bolt.svg';

// ── user ───────────────────────────────────────────────────────────
import king from '../../../assets/icons/user/king.svg';
import leader from '../../../assets/icons/user/leader.svg';
import groupLead from '../../../assets/icons/user/group-lead.svg';
import referral from '../../../assets/icons/user/referral.svg';
import giveRights from '../../../assets/icons/user/give-rights.svg';
import team from '../../../assets/icons/user/team.svg';
import work from '../../../assets/icons/user/work.svg';

/**
 * The registry. Keys are **kebab-case**, always matching the filename.
 * Consumers should use `Sh3IconName` to benefit from autocomplete and
 * compile-time safety — never a raw `string`.
 */
export const SH3_ICONS = {
  // actions
  upload,
  download,
  edit,
  'add-doc': addDoc,
  search,
  reset,
  view,
  bin,
  logout,
  'playlist-add': playlistAdd,
  // navigation
  'caret-up': caretUp,
  'caret-down': caretDown,
  folder,
  menu,
  // menu
  home,
  program,
  company,
  contracts,
  settings,
  stats,
  music,
  // music (domain)
  metronome,
  'music-file': musicFile,
  play,
  'play-circle': playCircle,
  fire,
  heart,
  'heart-border': heartBorder,
  // status
  completed,
  clock,
  diamond,
  award,
  lightning,
  'offline-bolt': offlineBolt,
  // user
  king,
  leader,
  'group-lead': groupLead,
  referral,
  'give-rights': giveRights,
  team,
  work,
} as const;

/**
 * All valid icon names — derived from the registry keys.
 * @example
 * ```ts
 * const name: Sh3IconName = 'search'; // ✓
 * const typo: Sh3IconName = 'serach'; // ✗ compile error
 * ```
 */
export type Sh3IconName = keyof typeof SH3_ICONS;
