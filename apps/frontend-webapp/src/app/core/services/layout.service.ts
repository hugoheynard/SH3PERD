import {Injectable, signal, Type} from '@angular/core';

/*
type LayoutPanelConfig<T> = {
  component: Type<unknown> | null;
  data?: T
}*/


@Injectable({ providedIn: 'root' })
export class LayoutService {
  private _leftPanelComponent = signal<Type<unknown> | null>(null);
  private _rightPanelComponent = signal<{ component: Type<unknown>, data?: unknown
  } | null>(null);
  private _contextMenuComponent = signal<Type<unknown> | null>(null);

  readonly leftPanelComponent = this._leftPanelComponent.asReadonly();
  readonly rightPanelComponent = this._rightPanelComponent.asReadonly();
  readonly contextMenuComponent = this._contextMenuComponent.asReadonly();

  setLeftPanel(component: Type<unknown> | null): void {
    this._leftPanelComponent.set(component);
  };

  setRightPanel<TComp, TData>(component: Type<TComp>,  data?: TData): void {
    this._rightPanelComponent.set({ component, data });
  };

  clearRightPanel(): void {
    this._rightPanelComponent.set(null);
  }

  setContextMenu(component: Type<unknown> | null): void {
    this._contextMenuComponent.set(component);
  };

  clearAll(): void {
    this.setLeftPanel(null);
    this.clearRightPanel();
    this.setContextMenu(null);
  };
}
