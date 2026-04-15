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
 * Taxonomy (usage-based)
 * - ui/        Generic controls + verbs on items (chevrons, close, plus,
 *              check, search, eye, edit, bin, upload, download, menu, …)
 * - nav/       App-level chrome (top-level routes, theme, notifications,
 *              help). What goes in the sidebar / header.
 * - music/     Music domain — playback transport + ratings + instruments.
 * - status/    Feedback badges (completed, clock, diamond, award, …).
 * - people/    User and role indicators (king, leader, team, …).
 * - brands/    Third-party platform logos (slack, whatsapp, teams, …).
 */

// ── ui ─────────────────────────────────────────────────────────────
import addDoc from '../../../assets/icons/ui/add-doc.svg';
import arrowBack from '../../../assets/icons/ui/arrow-back.svg';
import arrowRight from '../../../assets/icons/ui/arrow-right.svg';
import bin from '../../../assets/icons/ui/bin.svg';
import check from '../../../assets/icons/ui/check.svg';
import checkCircle from '../../../assets/icons/ui/check-circle.svg';
import chevronDown from '../../../assets/icons/ui/chevron-down.svg';
import chevronLeft from '../../../assets/icons/ui/chevron-left.svg';
import chevronRight from '../../../assets/icons/ui/chevron-right.svg';
import chevronUp from '../../../assets/icons/ui/chevron-up.svg';
import close from '../../../assets/icons/ui/close.svg';
import collapseAll from '../../../assets/icons/ui/collapse-all.svg';
import download from '../../../assets/icons/ui/download.svg';
import edit from '../../../assets/icons/ui/edit.svg';
import expandAll from '../../../assets/icons/ui/expand-all.svg';
import eye from '../../../assets/icons/ui/eye.svg';
import eyeOff from '../../../assets/icons/ui/eye-off.svg';
import fileAdd from '../../../assets/icons/ui/file-add.svg';
import folder from '../../../assets/icons/ui/folder.svg';
import folderOpen from '../../../assets/icons/ui/folder-open.svg';
import globe from '../../../assets/icons/ui/globe.svg';
import grid from '../../../assets/icons/ui/grid.svg';
import list from '../../../assets/icons/ui/list.svg';
import lock from '../../../assets/icons/ui/lock.svg';
import menu from '../../../assets/icons/ui/menu.svg';
import plus from '../../../assets/icons/ui/plus.svg';
import playlistAdd from '../../../assets/icons/ui/playlist-add.svg';
import reload from '../../../assets/icons/ui/reload.svg';
import reset from '../../../assets/icons/ui/reset.svg';
import save from '../../../assets/icons/ui/save.svg';
import search from '../../../assets/icons/ui/search.svg';
import sliders from '../../../assets/icons/ui/sliders.svg';
import ungroup from '../../../assets/icons/ui/ungroup.svg';
import upload from '../../../assets/icons/ui/upload.svg';
import view from '../../../assets/icons/ui/view.svg';

// ── nav ────────────────────────────────────────────────────────────
import bell from '../../../assets/icons/nav/bell.svg';
import company from '../../../assets/icons/nav/company.svg';
import contracts from '../../../assets/icons/nav/contracts.svg';
import help from '../../../assets/icons/nav/help.svg';
import home from '../../../assets/icons/nav/home.svg';
import logout from '../../../assets/icons/nav/logout.svg';
import music from '../../../assets/icons/nav/music.svg';
import program from '../../../assets/icons/nav/program.svg';
import settings from '../../../assets/icons/nav/settings.svg';
import stats from '../../../assets/icons/nav/stats.svg';
import themeDark from '../../../assets/icons/nav/theme-dark.svg';
import themeLight from '../../../assets/icons/nav/theme-light.svg';

// ── music ──────────────────────────────────────────────────────────
import fastForward from '../../../assets/icons/music/fast-forward.svg';
import fire from '../../../assets/icons/music/fire.svg';
import heart from '../../../assets/icons/music/heart.svg';
import heartBorder from '../../../assets/icons/music/heart-border.svg';
import metronome from '../../../assets/icons/music/metronome.svg';
import microphone from '../../../assets/icons/music/microphone.svg';
import musicFile from '../../../assets/icons/music/music-file.svg';
import musicNote from '../../../assets/icons/music/music-note.svg';
import mute from '../../../assets/icons/music/mute.svg';
import nextTrack from '../../../assets/icons/music/next-track.svg';
import pause from '../../../assets/icons/music/pause.svg';
import play from '../../../assets/icons/music/play.svg';
import playCircle from '../../../assets/icons/music/play-circle.svg';
import prevTrack from '../../../assets/icons/music/prev-track.svg';
import repeat from '../../../assets/icons/music/repeat.svg';
import rewind from '../../../assets/icons/music/rewind.svg';
import volume from '../../../assets/icons/music/volume.svg';
import waveform from '../../../assets/icons/music/waveform.svg';

// ── status ─────────────────────────────────────────────────────────
import award from '../../../assets/icons/status/award.svg';
import clock from '../../../assets/icons/status/clock.svg';
import completed from '../../../assets/icons/status/completed.svg';
import diamond from '../../../assets/icons/status/diamond.svg';
import lightning from '../../../assets/icons/status/lightning.svg';
import offlineBolt from '../../../assets/icons/status/offline-bolt.svg';

// ── people ─────────────────────────────────────────────────────────
import briefcase from '../../../assets/icons/people/briefcase.svg';
import giveRights from '../../../assets/icons/people/give-rights.svg';
import groupLead from '../../../assets/icons/people/group-lead.svg';
import king from '../../../assets/icons/people/king.svg';
import leader from '../../../assets/icons/people/leader.svg';
import referral from '../../../assets/icons/people/referral.svg';
import team from '../../../assets/icons/people/team.svg';
import work from '../../../assets/icons/people/work.svg';

// ── brands ─────────────────────────────────────────────────────────
import discord from '../../../assets/icons/brands/discord.svg';
import slack from '../../../assets/icons/brands/slack.svg';
import teams from '../../../assets/icons/brands/teams.svg';
import telegram from '../../../assets/icons/brands/telegram.svg';
import whatsapp from '../../../assets/icons/brands/whatsapp.svg';

/**
 * The registry. Keys are **kebab-case**, always matching the filename.
 * Consumers should use `Sh3IconName` to benefit from autocomplete and
 * compile-time safety — never a raw `string`.
 */
export const SH3_ICONS = {
  // ui
  'add-doc': addDoc,
  'arrow-back': arrowBack,
  'arrow-right': arrowRight,
  bin,
  check,
  'check-circle': checkCircle,
  'chevron-down': chevronDown,
  'chevron-left': chevronLeft,
  'chevron-right': chevronRight,
  'chevron-up': chevronUp,
  close,
  'collapse-all': collapseAll,
  download,
  edit,
  'expand-all': expandAll,
  eye,
  'eye-off': eyeOff,
  'file-add': fileAdd,
  folder,
  'folder-open': folderOpen,
  globe,
  grid,
  list,
  lock,
  menu,
  plus,
  'playlist-add': playlistAdd,
  reload,
  reset,
  save,
  search,
  sliders,
  ungroup,
  upload,
  view,
  // nav
  bell,
  company,
  contracts,
  help,
  home,
  logout,
  music,
  program,
  settings,
  stats,
  'theme-dark': themeDark,
  'theme-light': themeLight,
  // music
  'fast-forward': fastForward,
  fire,
  heart,
  'heart-border': heartBorder,
  metronome,
  microphone,
  'music-file': musicFile,
  'music-note': musicNote,
  mute,
  'next-track': nextTrack,
  pause,
  play,
  'play-circle': playCircle,
  'prev-track': prevTrack,
  repeat,
  rewind,
  volume,
  waveform,
  // status
  award,
  clock,
  completed,
  diamond,
  lightning,
  'offline-bolt': offlineBolt,
  // people
  briefcase,
  'give-rights': giveRights,
  'group-lead': groupLead,
  king,
  leader,
  referral,
  team,
  work,
  // brands
  discord,
  slack,
  teams,
  telegram,
  whatsapp,
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
