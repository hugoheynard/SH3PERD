import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import { DragLayerComponent } from '../drag-and-drop/drag-layer/drag-layer.component';
import { DndRootComponent } from '../drag-and-drop/dnd-root/dnd-root.component';



@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    DragLayerComponent,
    DndRootComponent,
  ],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent{}
