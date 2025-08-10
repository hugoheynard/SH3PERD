import { Component } from '@angular/core';
import {
  DisplayGrid,
  GridsterComponent,
  GridsterConfig,
  GridsterItem,
  GridsterItemComponent, GridsterItemComponentInterface,
  GridType,
} from 'angular-gridster2';
import { NgComponentOutlet, NgForOf } from '@angular/common';
import { WorkspaceContractWidgetComponent } from '../workspace-contract-widget/workspace-contract-widget.component';
import { TodayDateWidgetComponent } from '../today-date-widget/today-date-widget.component';

export interface WidgetItem extends GridsterItem {
  component: any
}

@Component({
  selector: 'app-widget-grid',
  imports: [
    GridsterComponent,
    GridsterItemComponent,
    NgComponentOutlet,
    NgForOf,
  ],
  templateUrl: './widget-grid.component.html',
  standalone: true,
  styleUrl: './widget-grid.component.scss',
})
export class WidgetGridComponent {
  options: GridsterConfig = {
    gridType: GridType.Fixed,        // 🧱 Grille à dimensions fixes
    fixedColWidth: 140,              // largeur d'une colonne (px)
    fixedRowHeight: 140,             // hauteur d'une ligne (px)
    margin: 10,                      // espace entre les widgets (px);
    displayGrid: DisplayGrid.OnDragAndResize,
    draggable: { enabled: true },
    resizable: { enabled: true },
    pushItems: true,
    swap: false,
    itemChangeCallback: this.itemChange.bind(this),
  }

  dashboard: WidgetItem[] = [
    { cols: 1, rows: 1, y: 0, x: 2, resizeEnabled: false, component: TodayDateWidgetComponent },
    { cols: 2, rows: 1, y: 0, x: 0, resizeEnabled: false, component: WorkspaceContractWidgetComponent },

  ]

  itemChange(item: GridsterItem, itemComponent: GridsterItemComponentInterface): void {
    const typedItem = item as WidgetItem
    console.log('item changed', typedItem.component);
  }
}
