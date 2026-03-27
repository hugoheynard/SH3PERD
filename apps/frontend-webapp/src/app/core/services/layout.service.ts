import {Injectable, signal, Type} from '@angular/core';

/*
type LayoutPanelConfig<T> = {
  component: Type<unknown> | null;
  data?: T
}*/


@Injectable({ providedIn: 'root' })
export class LayoutService {
  private _leftPanelComponent = signal<{ component: Type<unknown>, data?: unknown, mode?: 'over' | 'push' } | null>(null);
  private _rightPanelComponent = signal<{ component: Type<unknown>, data?: unknown, mode?: 'over' | 'push' } | null>(null);
  private _contextMenuComponent = signal<Type<unknown> | null>(null);
  private _popoverComponent = signal<{ component: Type<unknown>, data?: unknown } | null>(null);

  readonly leftPanelComponent = this._leftPanelComponent.asReadonly();
  readonly rightPanelComponent = this._rightPanelComponent.asReadonly();
  readonly contextMenuComponent = this._contextMenuComponent.asReadonly();
  readonly popoverComponent = this._popoverComponent.asReadonly();

  setLeftPanel<TComp, TData>(component: Type<TComp>, data?: TData, mode: 'over' | 'push' = 'push'): void {
    this._leftPanelComponent.set({ component, data, mode });
  };

  setRightPanel<TComp, TData>(component: Type<TComp>, data?: TData, mode: 'over' | 'push' = 'over'): void {
    this._rightPanelComponent.set({ component, data, mode });
  };

  setPopover<TComp, TData>(component: Type<TComp>, data?: TData): void {
    this.clearPopover();
    this._popoverComponent.set({ component, data });
  }

  clearRightPanel(): void {
    this._rightPanelComponent.set(null);
  }

  clearPopover(): void {
    this._popoverComponent.set(null);
  };

  setContextMenu(component: Type<unknown> | null): void {
    this._contextMenuComponent.set(component);
  };

  clearAll(): void {
    this.clearRightPanel();
    this.setContextMenu(null);
    this.clearPopover();
  };
}
