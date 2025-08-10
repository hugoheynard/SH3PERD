import { Component } from '@angular/core';
import { TodayDateWidgetComponent } from '../today-date-widget/today-date-widget.component';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgComponentOutlet, NgForOf, NgStyle } from '@angular/common';
import { WorkspaceContractWidgetComponent } from '../workspace-contract-widget/workspace-contract-widget.component';
import { WidgetGridComponent } from '../widget-grid/widget-grid.component';

@Component({
  selector: 'app-home',
  imports: [
    WidgetGridComponent,
  ],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.scss',
})
export class HomeComponent {

  widgets: any[] = [
    { id: 'date-1',
      cols: 1,
      rows: 1,
      component: TodayDateWidgetComponent
    },
    {
      id: 'workspaceContract',
      cols: 2,
      rows: 1,
      component: WorkspaceContractWidgetComponent
    },
    {
      id: 'workspaceContract',
      cols: 2,
      rows: 2,
      component: WorkspaceContractWidgetComponent
    },
  ]

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.widgets, event.previousIndex, event.currentIndex)
  }

}
