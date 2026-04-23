import { InjectionToken } from '@angular/core';

/**
 * Per-instance context exposed to each widget component mounted on the
 * dashboard grid. Provided by {@link WidgetGridComponent} through an
 * injector forwarded to `ngComponentOutlet`, so a widget can:
 *
 * - Identify itself (stable `instanceId`, matches the persisted
 *   `TWidgetInstance.id`).
 * - Request an update to its own persisted `data` — the grid is then
 *   responsible for writing it back to the layout and re-rendering.
 *
 * The callback accepts `unknown` rather than a union because the token
 * is shared by every widget type; each widget narrows to its own
 * `T<Name>WidgetConfig` before calling.
 */
export interface WidgetContext {
  readonly instanceId: string;
  /** Replaces this widget's persisted `data` (pass `undefined` to clear). */
  requestDataUpdate(data: unknown): void;
}

export const WIDGET_CONTEXT = new InjectionToken<WidgetContext>(
  'WIDGET_CONTEXT',
);
