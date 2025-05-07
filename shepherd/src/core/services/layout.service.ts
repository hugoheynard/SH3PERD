import {Injectable, signal, Type} from '@angular/core';


@Injectable({ providedIn: 'root' })
export class LayoutService {
  private _leftPanelComponent = signal<Type<unknown> | null>(null);
  private _rightPanelComponent = signal<Type<unknown> | null>(null);
  private _contextMenuComponent = signal<Type<unknown> | null>(null);

  readonly leftPanelComponent = this._leftPanelComponent.asReadonly();
  readonly rightPanelComponent = this._rightPanelComponent.asReadonly();
  readonly contextMenuComponent = this._contextMenuComponent.asReadonly();

  setLeftPanel(component: Type<unknown> | null): void {
    this._leftPanelComponent.set(component);
  };

  setRightPanel(component: Type<unknown> | null): void {
    this._rightPanelComponent.set(component);
  };

  setContextMenu(component: Type<unknown> | null): void {
    this._contextMenuComponent.set(component);
  };

  clearAll(): void {
    this.setLeftPanel(null);
    this.setRightPanel(null);
    this.setContextMenu(null);
  };
}
