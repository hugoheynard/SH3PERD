import { z } from "zod";
import { SMusicVersionId, SVersionTrackId } from "./ids.js";

/**
 * ─── Home dashboard widget configuration ────────────────────────────
 *
 * Source-of-truth schemas for the widgets that live on a user's home
 * dashboard. Two reasons these belong in `shared-types`:
 *
 * 1. The frontend persists dashboard layouts (today via localStorage,
 *    tomorrow via a `SaveDashboardLayoutCommand`). Whoever writes the
 *    backend command should find the exact same schema here — no
 *    parallel DTOs to keep in sync.
 *
 * 2. Widget `data` is a discriminated union keyed by `defId`. The
 *    discriminator + per-variant schemas are defined once here and
 *    reused by every consumer (UI inputs, command payloads, future
 *    Mongo read-models).
 *
 * Adding a new widget type
 * ------------------------
 * - Add its id to `WIDGET_DEF_IDS`.
 * - Add a `S<Name>WidgetConfig` schema (and `T<Name>WidgetConfig` type).
 * - Add a variant to `SWidgetInstance`'s discriminated union.
 * - Wire the matching component + default config in the frontend
 *   widget catalog (`home-dashboard/widget-catalog/widget-catalog.ts`).
 */

// ─── Widget def id (discriminator) ──────────────────────────────────

/**
 * Canonical identifiers for widgets the home dashboard knows about.
 *
 * Keep this list in sync with the frontend `WIDGET_CATALOG`. The
 * runtime `z.enum` refuses unknown ids at the storage boundary, so a
 * widget removed from the catalog can't silently resurrect as a badly-
 * typed instance.
 */
export const WIDGET_DEF_IDS = [
  "home-music",
  "workspace-contract",
  "today-date",
] as const;
export const SWidgetDefId = z.enum(WIDGET_DEF_IDS);
export type TWidgetDefId = z.infer<typeof SWidgetDefId>;

// ─── Grid position + size ───────────────────────────────────────────

/**
 * Where a widget sits on the grid. Mirrors `angular-gridster2`'s
 * `{x, y, cols, rows}` contract exactly — any runtime that renders
 * the dashboard feeds these four numbers straight into its grid
 * engine without translation.
 */
export const SWidgetPosition = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  cols: z.number().int().positive(),
  rows: z.number().int().positive(),
});
export type TWidgetPosition = z.infer<typeof SWidgetPosition>;

// ─── Per-widget data schemas ────────────────────────────────────────

/**
 * Music player widget — pins a single version/track that the widget
 * will load into the global `AudioPlayerService` when the user hits
 * play. Everything is optional so the widget also round-trips the
 * "empty" state without needing special-case persistence.
 */
export const SMusicPlayerWidgetConfig = z.object({
  versionId: SMusicVersionId.optional(),
  trackId: SVersionTrackId.optional(),
  /** Display title shown on the widget face. */
  title: z.string().optional(),
  /** Secondary line under the title (artist / version label). */
  subtitle: z.string().optional(),
});
export type TMusicPlayerWidgetConfig = z.infer<typeof SMusicPlayerWidgetConfig>;

/** Today date widget — optional locale override for formatting. */
export const STodayDateWidgetConfig = z.object({
  locale: z.string().min(2).optional(),
});
export type TTodayDateWidgetConfig = z.infer<typeof STodayDateWidgetConfig>;

/**
 * Workspace contract widget — no per-instance data yet (everything is
 * resolved server-side from the active contract). Kept as an explicit
 * empty object so future fields can land here without migrating the
 * storage format.
 */
export const SWorkspaceContractWidgetConfig = z.object({}).strict();
export type TWorkspaceContractWidgetConfig = z.infer<
  typeof SWorkspaceContractWidgetConfig
>;

// ─── Widget instance (discriminated union) ──────────────────────────

/**
 * A single widget placed on the dashboard. The `defId` discriminator
 * guarantees `data` is narrowed to the matching config type at both
 * compile and runtime.
 *
 * `id` is a per-instance, client-generated stable key (UUID). It
 * survives drag/resize/reload and is what the backend will eventually
 * use as the primary key when the dashboard moves to Mongo.
 */
export const SWidgetInstance = z.discriminatedUnion("defId", [
  z.object({
    id: z.string().min(1),
    defId: z.literal("home-music"),
    position: SWidgetPosition,
    data: SMusicPlayerWidgetConfig.optional(),
  }),
  z.object({
    id: z.string().min(1),
    defId: z.literal("workspace-contract"),
    position: SWidgetPosition,
    data: SWorkspaceContractWidgetConfig.optional(),
  }),
  z.object({
    id: z.string().min(1),
    defId: z.literal("today-date"),
    position: SWidgetPosition,
    data: STodayDateWidgetConfig.optional(),
  }),
]);
export type TWidgetInstance = z.infer<typeof SWidgetInstance>;

// ─── Dashboard layout ───────────────────────────────────────────────

/**
 * Current layout schema version. Bump when a breaking change lands
 * (renamed field, removed def id, restructured data). The storage
 * layer uses this to decide whether to hydrate, migrate or discard.
 */
export const DASHBOARD_LAYOUT_VERSION = 1;

/**
 * A user's home dashboard — ordered list of widget instances plus the
 * schema version that produced them.
 */
export const SDashboardLayout = z.object({
  version: z.number().int().positive(),
  widgets: z.array(SWidgetInstance),
});
export type TDashboardLayout = z.infer<typeof SDashboardLayout>;
