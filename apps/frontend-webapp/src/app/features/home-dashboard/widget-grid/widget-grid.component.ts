import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  signal,
  type Type,
} from '@angular/core';
import {
  DisplayGrid,
  GridsterComponent,
  type GridsterConfig,
  type GridsterItem,
  type GridsterItemComponentInterface,
  GridsterItemComponent,
  GridType,
} from 'angular-gridster2';
import { NgComponentOutlet } from '@angular/common';
import {
  DASHBOARD_LAYOUT_VERSION,
  SMusicPlayerWidgetConfig,
  STodayDateWidgetConfig,
  type TDashboardLayout,
  type TMusicPlayerWidgetConfig,
  type TTodayDateWidgetConfig,
  type TWidgetDefId,
  type TWidgetInstance,
  type TWidgetPosition,
} from '@sh3pherd/shared-types';
import {
  getWidgetDefinition,
  WIDGET_CATALOG,
  type WidgetDefinition,
} from '../widget-catalog/widget-catalog';
import { DashboardLayoutStore } from '../services/dashboard-layout.store';
import { WIDGET_CONTEXT, type WidgetContext } from '../widget-context';

/**
 * A live widget sitting on the Gridster grid. Extends `GridsterItem`
 * (x, y, cols, rows…) with:
 *
 * - `instanceId` — stable per-instance key (UUID). Matches the
 *   corresponding `TWidgetInstance.id` in the persisted layout and is
 *   what drag/resize callbacks use to find the right row to update.
 * - `defId`     — discriminator from the shared-types catalog.
 * - `component` — resolved Angular type for `ngComponentOutlet`.
 * - `inputs`    — typed bag forwarded through `ngComponentOutlet`.
 *   Derived from `TWidgetInstance.data` via {@link buildWidgetInputs}.
 * - `injector`  — per-instance child injector that provides
 *   {@link WIDGET_CONTEXT}, so the mounted component can identify
 *   itself and request data updates without prop-drilling.
 */
export interface WidgetItem extends GridsterItem {
  instanceId: string;
  defId: TWidgetDefId;
  component: Type<unknown>;
  inputs?: Record<string, unknown>;
  injector?: Injector;
}

/**
 * Default layout shown the very first time a user lands on the home
 * dashboard (or after clearing the persisted layout).
 */
function buildDefaultLayout(): TDashboardLayout {
  return {
    version: DASHBOARD_LAYOUT_VERSION,
    widgets: [
      {
        id: newInstanceId(),
        defId: 'today-date',
        position: { x: 2, y: 0, cols: 1, rows: 1 },
      },
      {
        id: newInstanceId(),
        defId: 'workspace-contract',
        position: { x: 0, y: 0, cols: 2, rows: 1 },
      },
    ],
  };
}

/** Browser-safe id generator — falls back to a timestamped random string. */
function newInstanceId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `w_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Builds the `ngComponentOutlet` inputs bag for a given widget
 * instance. One place to map persisted typed `data` → component
 * inputs, so the grid stays agnostic of individual widget APIs.
 */
function buildWidgetInputs(
  instance: TWidgetInstance,
): Record<string, unknown> | undefined {
  switch (instance.defId) {
    case 'home-music':
      return instance.data ? { config: instance.data } : undefined;
    case 'today-date':
      return instance.data?.locale
        ? { locale: instance.data.locale }
        : undefined;
    case 'workspace-contract':
      return undefined;
  }
}

@Component({
  selector: 'app-widget-grid',
  standalone: true,
  imports: [GridsterComponent, GridsterItemComponent, NgComponentOutlet],
  templateUrl: './widget-grid.component.html',
  styleUrl: './widget-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetGridComponent {
  private readonly store = inject(DashboardLayoutStore);
  private readonly parentInjector = inject(Injector);

  /** Full widget catalog — exposed for future extension points. */
  readonly catalog = WIDGET_CATALOG;

  readonly options: GridsterConfig = {
    gridType: GridType.Fixed,
    fixedColWidth: 140,
    fixedRowHeight: 140,
    margin: 10,
    displayGrid: DisplayGrid.OnDragAndResize,
    draggable: { enabled: true },
    resizable: { enabled: true },
    pushItems: true,
    swap: false,
    itemChangeCallback: this.onItemChange.bind(this),
  };

  /**
   * Live dashboard — Gridster mutates items in place (x/y/cols/rows),
   * but adds/removes go through our signal so OnPush re-renders.
   * Serialised back to the store on every write path.
   */
  readonly dashboard = signal<WidgetItem[]>(this.hydrate());

  // ── Public API ─────────────────────────────────────────────────

  /**
   * Inserts a widget from the catalog. Gridster resolves the final
   * `x`/`y` placement from the `pushItems` policy when left at 0.
   * The new instance is persisted immediately so a reload picks it up.
   */
  addWidget(def: WidgetDefinition): void {
    const instance: TWidgetInstance = this.makeEmptyInstance(def);
    const item = this.toWidgetItem(instance);
    if (!item) return;
    this.dashboard.update((items) => [...items, item]);
    this.persist();
  }

  /** Removes a widget by its stable `instanceId`. */
  removeWidget(instanceId: string): void {
    this.dashboard.update((items) =>
      items.filter((i) => i.instanceId !== instanceId),
    );
    this.persist();
  }

  /**
   * Replaces a widget's persisted `data` and refreshes the `inputs`
   * bag that `ngComponentOutlet` forwards to the mounted component.
   * Used by the music picker flow — the widget asks for an update
   * through the {@link WIDGET_CONTEXT}, we swap the inputs ref (so
   * Angular re-applies them) and persist.
   *
   * Passing `undefined` clears the widget's data (back to empty).
   */
  updateWidgetData(instanceId: string, data: unknown): void {
    this.dashboard.update((items) =>
      items.map((item) => {
        if (item.instanceId !== instanceId) return item;
        // Rebuild the inputs bag from the updated data, but reuse the
        // Gridster-live positional fields — those belong to Gridster.
        const updatedInstance = this.mergeInstanceData(item, data);
        const nextInputs = buildWidgetInputs(updatedInstance);
        return { ...item, inputs: nextInputs };
      }),
    );
    this.persist();
  }

  // ── Gridster callback ──────────────────────────────────────────

  private onItemChange(
    item: GridsterItem,
    _ref: GridsterItemComponentInterface,
  ): void {
    // Gridster mutates the same `WidgetItem` reference — our signal
    // already points at it, so just re-persist.
    void item;
    this.persist();
  }

  // ── Internals ──────────────────────────────────────────────────

  /**
   * Loads the persisted layout (or the default) and turns each
   * `TWidgetInstance` into a `WidgetItem`. Instances whose `defId`
   * is no longer in the catalog are silently dropped — letting them
   * through would crash `ngComponentOutlet`.
   */
  private hydrate(): WidgetItem[] {
    const layout = this.store.loadLayout() ?? buildDefaultLayout();
    return layout.widgets
      .map((instance) => this.toWidgetItem(instance))
      .filter((i): i is WidgetItem => i !== null);
  }

  /** Turns a persisted `TWidgetInstance` into a Gridster-ready `WidgetItem`. */
  private toWidgetItem(instance: TWidgetInstance): WidgetItem | null {
    const def = getWidgetDefinition(instance.defId);
    if (!def) return null;
    return {
      instanceId: instance.id,
      defId: instance.defId,
      component: def.component,
      inputs: buildWidgetInputs(instance),
      injector: this.makeInstanceInjector(instance.id),
      x: instance.position.x,
      y: instance.position.y,
      cols: instance.position.cols,
      rows: instance.position.rows,
    };
  }

  /**
   * Child injector carrying the {@link WIDGET_CONTEXT} for this
   * widget. We memoise by capturing the id in the closure, so the
   * context object never outlives the widget instance.
   */
  private makeInstanceInjector(instanceId: string): Injector {
    const ctx: WidgetContext = {
      instanceId,
      requestDataUpdate: (data) => this.updateWidgetData(instanceId, data),
    };
    return Injector.create({
      parent: this.parentInjector,
      providers: [{ provide: WIDGET_CONTEXT, useValue: ctx }],
    });
  }

  /** Snapshots the live grid back into the persistence format. */
  private persist(): void {
    const layout: TDashboardLayout = {
      version: DASHBOARD_LAYOUT_VERSION,
      widgets: this.dashboard()
        .map((item) => this.toInstance(item))
        .filter((w): w is TWidgetInstance => w !== null),
    };
    this.store.saveLayout(layout);
  }

  /**
   * Rebuilds a typed `TWidgetInstance` from the Gridster-live
   * `WidgetItem`. Position is authoritative from the item (Gridster
   * keeps it up to date); data comes from whatever we last stored in
   * the inputs bag — the only mutation path for data goes through
   * {@link updateWidgetData}, so round-tripping here is lossless.
   */
  private toInstance(item: WidgetItem): TWidgetInstance | null {
    const position: TWidgetPosition = {
      x: item.x ?? 0,
      y: item.y ?? 0,
      cols: item.cols ?? 1,
      rows: item.rows ?? 1,
    };
    switch (item.defId) {
      case 'home-music': {
        const parsed = SMusicPlayerWidgetConfig.safeParse(
          item.inputs?.['config'],
        );
        return {
          id: item.instanceId,
          defId: 'home-music',
          position,
          data: parsed.success ? parsed.data : undefined,
        };
      }
      case 'today-date': {
        const parsed = STodayDateWidgetConfig.safeParse(
          item.inputs?.['locale'] !== undefined
            ? { locale: item.inputs?.['locale'] }
            : undefined,
        );
        return {
          id: item.instanceId,
          defId: 'today-date',
          position,
          data: parsed.success ? parsed.data : undefined,
        };
      }
      case 'workspace-contract':
        return {
          id: item.instanceId,
          defId: 'workspace-contract',
          position,
        };
    }
  }

  /**
   * Folds a generic `data` payload (typically coming from a widget's
   * own callback) back into a fully-typed {@link TWidgetInstance} for
   * the given item's `defId`. Invalid payloads clear the data slot
   * instead of poisoning the layout.
   */
  private mergeInstanceData(item: WidgetItem, data: unknown): TWidgetInstance {
    const base = {
      id: item.instanceId,
      position: {
        x: item.x ?? 0,
        y: item.y ?? 0,
        cols: item.cols ?? 1,
        rows: item.rows ?? 1,
      },
    };
    switch (item.defId) {
      case 'home-music': {
        const parsed = SMusicPlayerWidgetConfig.safeParse(data);
        const result: TMusicPlayerWidgetConfig | undefined = parsed.success
          ? parsed.data
          : undefined;
        return { ...base, defId: 'home-music', data: result };
      }
      case 'today-date': {
        const parsed = STodayDateWidgetConfig.safeParse(data);
        const result: TTodayDateWidgetConfig | undefined = parsed.success
          ? parsed.data
          : undefined;
        return { ...base, defId: 'today-date', data: result };
      }
      case 'workspace-contract':
        return { ...base, defId: 'workspace-contract' };
    }
  }

  /** Produces a fresh `TWidgetInstance` with default layout + empty data. */
  private makeEmptyInstance(def: WidgetDefinition): TWidgetInstance {
    const position: TWidgetPosition = {
      x: 0,
      y: 0,
      cols: def.defaultCols,
      rows: def.defaultRows,
    };
    switch (def.id) {
      case 'home-music':
        return { id: newInstanceId(), defId: 'home-music', position };
      case 'today-date':
        return { id: newInstanceId(), defId: 'today-date', position };
      case 'workspace-contract':
        return { id: newInstanceId(), defId: 'workspace-contract', position };
    }
  }
}
