import type { Type } from '@angular/core';
import type { TWidgetDefId } from '@sh3pherd/shared-types';
import type { Sh3IconName } from '../../../shared/icon/icon.registry';
import { TodayDateWidgetComponent } from '../today-date-widget/today-date-widget.component';
import { WorkspaceContractWidgetComponent } from '../workspace-contract-widget/workspace-contract-widget.component';
import { HomeMusicWidgetComponent } from '../home-music-widget/home-music-widget.component';

/**
 * Section key used to group widgets in the library panel.
 * Extend freely — the panel renders whatever sections appear in the
 * catalog, in the order defined by {@link WIDGET_SECTIONS}.
 */
export type WidgetSection = 'music' | 'workspace' | 'productivity';

export interface WidgetSectionMeta {
  readonly id: WidgetSection;
  readonly label: string;
}

/** Authoritative render order for the library panel. */
export const WIDGET_SECTIONS: readonly WidgetSectionMeta[] = [
  { id: 'music', label: 'Music' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'productivity', label: 'Productivity' },
] as const;

/**
 * Describes a widget that can be inserted from the library panel into
 * the dashboard grid. The definition carries both visual metadata
 * (label, description, icon) and the shape it takes on the grid
 * (default cols / rows) plus the component to mount.
 *
 * `id` is typed as the shared-types {@link TWidgetDefId} — the same
 * discriminator used in persisted `TWidgetInstance`s, so hydrating a
 * layout to its matching component is a typed lookup rather than a
 * runtime string match.
 */
export interface WidgetDefinition {
  readonly id: TWidgetDefId;
  readonly label: string;
  readonly description: string;
  readonly icon: Sh3IconName;
  readonly section: WidgetSection;
  readonly keywords?: readonly string[];
  readonly defaultCols: number;
  readonly defaultRows: number;
  readonly component: Type<unknown>;
}

/**
 * Catalog of widgets available for insertion. Kept as a plain
 * readonly array — no DI overhead needed and it's trivially tree-
 * shakeable. Add new widgets here, register the matching schema in
 * `shared-types/home-dashboard.types.ts`, done.
 */
export const WIDGET_CATALOG: readonly WidgetDefinition[] = [
  {
    id: 'home-music',
    label: 'Music player',
    description: 'Pin a track and play it from the dashboard.',
    icon: 'music-note',
    section: 'music',
    keywords: ['audio', 'play', 'track', 'song', 'player'],
    defaultCols: 2,
    defaultRows: 1,
    component: HomeMusicWidgetComponent,
  },
  {
    id: 'workspace-contract',
    label: 'Current contract',
    description: 'Your pinned contract — roles, dates, status.',
    icon: 'contracts',
    section: 'workspace',
    keywords: ['deal', 'client', 'engagement', 'company', 'role', 'favorite'],
    defaultCols: 2,
    defaultRows: 1,
    component: WorkspaceContractWidgetComponent,
  },
  {
    id: 'today-date',
    label: "Today's date",
    description: 'Weekday, day number, month and year at a glance.',
    icon: 'clock',
    section: 'productivity',
    keywords: ['calendar', 'date', 'day', 'today', 'weekday'],
    defaultCols: 1,
    defaultRows: 1,
    component: TodayDateWidgetComponent,
  },
] as const;

/**
 * O(1) lookup from a persisted `defId` back to the matching catalog
 * entry. Used by the grid when hydrating a `TDashboardLayout` — we
 * need the component reference to actually render each widget.
 */
const CATALOG_BY_ID = new Map(WIDGET_CATALOG.map((def) => [def.id, def]));

export function getWidgetDefinition(
  id: TWidgetDefId,
): WidgetDefinition | undefined {
  return CATALOG_BY_ID.get(id);
}

/**
 * Pure matcher — returns true when the query appears in the label,
 * description, or keywords. Case-insensitive, trimmed. Empty query
 * matches every widget (lets the panel collapse to "show all").
 */
export function matchesWidgetQuery(
  def: WidgetDefinition,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return true;
  if (def.label.toLowerCase().includes(q)) return true;
  if (def.description.toLowerCase().includes(q)) return true;
  return def.keywords?.some((k) => k.toLowerCase().includes(q)) ?? false;
}
